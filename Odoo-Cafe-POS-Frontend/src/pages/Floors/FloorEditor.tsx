/**
 * Floor Plan Editor
 * Drag-and-drop floor layout editor
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Circle, Square, X, Trash2, Save } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import './FloorEditor.css';

interface TableItem {
    id: string;
    name: string;
    seats: number;
    x: number;
    y: number;
    shape: 'square' | 'round';
}

interface Floor {
    id: string;
    name: string;
    tables: TableItem[];
}

// Load from localStorage or use defaults
const loadFloors = (): Floor[] => {
    const saved = localStorage.getItem('floor_plan_data');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            // Return defaults if parse fails
        }
    }
    return [
        {
            id: 'floor-1',
            name: 'Main Dining',
            tables: [
                { id: 'table-1', name: 'T-01', seats: 4, x: 50, y: 50, shape: 'square' },
                { id: 'table-2', name: 'T-02', seats: 2, x: 200, y: 50, shape: 'square' },
                { id: 'table-3', name: 'T-03', seats: 6, x: 350, y: 50, shape: 'round' },
                { id: 'table-4', name: 'T-04', seats: 4, x: 50, y: 200, shape: 'square' },
                { id: 'table-5', name: 'T-05', seats: 8, x: 200, y: 200, shape: 'round' },
            ],
        },
        {
            id: 'floor-2',
            name: 'Terrace',
            tables: [
                { id: 'table-6', name: 'P-01', seats: 4, x: 50, y: 50, shape: 'square' },
                { id: 'table-7', name: 'P-02', seats: 2, x: 200, y: 50, shape: 'round' },
            ],
        },
    ];
};

const FloorEditor = () => {
    const [floors, setFloors] = useState<Floor[]>(loadFloors);
    const [activeFloorId, setActiveFloorId] = useState<string>(floors[0]?.id || '');
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
    const [editingTable, setEditingTable] = useState<TableItem | null>(null);
    const [isSaved, setIsSaved] = useState(true);

    const activeFloor = floors.find(f => f.id === activeFloorId);

    const handleDragEnd = useCallback((tableId: string, x: number, y: number) => {
        setFloors(prev => prev.map(floor => {
            if (floor.id !== activeFloorId) return floor;
            return {
                ...floor,
                tables: floor.tables.map(table =>
                    table.id === tableId ? { ...table, x: Math.max(0, x), y: Math.max(0, y) } : table
                ),
            };
        }));
        setIsSaved(false);
    }, [activeFloorId]);

    const addTable = (seats: number, shape: 'square' | 'round') => {
        if (!activeFloor) return;

        const tableCount = activeFloor.tables.length + 1;
        const newTable: TableItem = {
            id: `table-${Date.now()}`,
            name: `${activeFloor.name.charAt(0)}-${tableCount.toString().padStart(2, '0')}`,
            seats,
            x: 50 + (tableCount % 5) * 120,
            y: 50 + Math.floor(tableCount / 5) * 120,
            shape,
        };

        setFloors(prev => prev.map(floor =>
            floor.id === activeFloorId
                ? { ...floor, tables: [...floor.tables, newTable] }
                : floor
        ));
        setIsSaved(false);
    };

    const deleteTable = (tableId: string) => {
        setFloors(prev => prev.map(floor =>
            floor.id === activeFloorId
                ? { ...floor, tables: floor.tables.filter(t => t.id !== tableId) }
                : floor
        ));
        setSelectedTable(null);
        setEditingTable(null);
        setIsSaved(false);
    };

    const updateTableName = (tableId: string, name: string) => {
        setFloors(prev => prev.map(floor =>
            floor.id === activeFloorId
                ? {
                    ...floor,
                    tables: floor.tables.map(t =>
                        t.id === tableId ? { ...t, name } : t
                    ),
                }
                : floor
        ));
        setIsSaved(false);
    };

    const saveToLocalStorage = () => {
        localStorage.setItem('floor_plan_data', JSON.stringify(floors));
        setIsSaved(true);
    };

    return (
        <AdminPageLayout
            title="Floor Plan Editor"
            showSearch={false}
            showNewButton={false}
        >
            <div className="floor-editor">
                {/* Toolbar */}
                <div className="floor-editor__toolbar">
                    <div className="floor-editor__tabs">
                        {floors.map(floor => (
                            <button
                                key={floor.id}
                                className={`floor-editor__tab ${activeFloorId === floor.id ? 'floor-editor__tab--active' : ''}`}
                                onClick={() => setActiveFloorId(floor.id)}
                            >
                                {floor.name}
                            </button>
                        ))}
                    </div>

                    <div className="floor-editor__actions">
                        <button
                            className="floor-editor__add-btn"
                            onClick={() => addTable(2, 'square')}
                            title="Add 2-Person Table"
                        >
                            <Square size={16} />
                            <Plus size={12} style={{ marginLeft: -4, marginRight: 4 }} />
                            2P
                        </button>
                        <button
                            className="floor-editor__add-btn"
                            onClick={() => addTable(4, 'square')}
                            title="Add 4-Person Table"
                        >
                            <Square size={16} />
                            <Plus size={12} style={{ marginLeft: -4, marginRight: 4 }} />
                            4P
                        </button>
                        <button
                            className="floor-editor__add-btn"
                            onClick={() => addTable(6, 'round')}
                            title="Add Round Table"
                        >
                            <Circle size={16} />
                            <Plus size={12} style={{ marginLeft: -4, marginRight: 4 }} />
                            Round
                        </button>

                        <div style={{ width: 1, height: 24, background: '#e5e7eb', marginLeft: 8 }} />

                        <button
                            className={`floor-editor__save-btn ${!isSaved ? 'floor-editor__save-btn--unsaved' : ''}`}
                            onClick={saveToLocalStorage}
                            disabled={isSaved}
                        >
                            <Save size={16} />
                            {isSaved ? 'Saved' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="floor-editor__canvas">
                    {activeFloor?.tables.map(table => (
                        <motion.div
                            key={table.id}
                            className={`floor-editor__table floor-editor__table--${table.shape} ${selectedTable?.id === table.id ? 'floor-editor__table--selected' : ''}`}
                            style={{
                                left: table.x,
                                top: table.y,
                            }}
                            drag
                            dragMomentum={false}
                            onDragEnd={(_, info) => {
                                handleDragEnd(table.id, table.x + info.offset.x, table.y + info.offset.y);
                            }}
                            onClick={() => setSelectedTable(table)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span className="floor-editor__table-name">{table.name}</span>
                            <span className="floor-editor__table-seats">{table.seats}P</span>
                        </motion.div>
                    ))}

                    {/* Empty state */}
                    {activeFloor?.tables.length === 0 && (
                        <div className="floor-editor__empty">
                            <p>No tables yet. Click the buttons above to add tables.</p>
                        </div>
                    )}
                </div>

                {/* Selected Table Panel */}
                <AnimatePresence>
                    {selectedTable && (
                        <motion.div
                            className="floor-editor__panel"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="floor-editor__panel-header">
                                <h3>Table Settings</h3>
                                <button onClick={() => setSelectedTable(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="floor-editor__panel-body">
                                <div className="admin-form__group">
                                    <label className="admin-form__label">Table Name</label>
                                    <input
                                        type="text"
                                        className="admin-form__input"
                                        value={editingTable?.name ?? selectedTable.name}
                                        onChange={(e) => {
                                            setEditingTable({ ...selectedTable, name: e.target.value });
                                        }}
                                        onBlur={() => {
                                            if (editingTable) {
                                                updateTableName(selectedTable.id, editingTable.name);
                                                setEditingTable(null);
                                            }
                                        }}
                                    />
                                </div>

                                <div className="floor-editor__panel-info">
                                    <p><strong>Seats:</strong> {selectedTable.seats}</p>
                                    <p><strong>Shape:</strong> {selectedTable.shape}</p>
                                    <p><strong>Position:</strong> ({Math.round(selectedTable.x)}, {Math.round(selectedTable.y)})</p>
                                </div>

                                <button
                                    className="admin-btn admin-btn--danger"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                    onClick={() => deleteTable(selectedTable.id)}
                                >
                                    <Trash2 size={16} />
                                    Delete Table
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AdminPageLayout>
    );
};

export default FloorEditor;
