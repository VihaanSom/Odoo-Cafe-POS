/**
 * Floor Plan Editor
 * Simple table management with floor selection dropdown
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Copy, Save, Edit2 } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './FloorEditor.css';

interface TableItem {
    id: string;
    tableNumber: string;
    seats: number;
    isActive: boolean;
    resource: string;
}

interface Floor {
    id: string;
    name: string;
    tables: TableItem[];
}

// Hardcoded floor options
const FLOOR_OPTIONS = [
    { value: 'main-dining', label: 'Main Dining' },
    { value: 'terrace', label: 'Terrace' },
];

// Load from localStorage or use defaults
const loadFloors = (): Floor[] => {
    const saved = localStorage.getItem('floor_plan_data_v3');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            // Return defaults if parse fails
        }
    }
    return [
        {
            id: 'main-dining',
            name: 'Main Dining',
            tables: [
                { id: 'table-1', tableNumber: '101', seats: 4, isActive: true, resource: 'Table 1 (Seating 4)' },
                { id: 'table-2', tableNumber: '102', seats: 6, isActive: true, resource: 'Table 2 (Seating 6)' },
                { id: 'table-3', tableNumber: '103', seats: 2, isActive: false, resource: 'Table 3 (Seating 2)' },
                { id: 'table-4', tableNumber: '104', seats: 8, isActive: true, resource: 'Table 4 (Seating 8)' },
            ],
        },
        {
            id: 'terrace',
            name: 'Terrace',
            tables: [
                { id: 'table-5', tableNumber: '201', seats: 4, isActive: true, resource: 'Terrace 1 (Seating 4)' },
                { id: 'table-6', tableNumber: '202', seats: 4, isActive: true, resource: 'Terrace 2 (Seating 4)' },
            ],
        },
    ];
};

const FloorEditor = () => {
    const [floors, setFloors] = useState<Floor[]>(loadFloors);
    const [activeFloorId, setActiveFloorId] = useState<string>('main-dining');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<TableItem | null>(null);
    const [isSaved, setIsSaved] = useState(true);

    const [tableFormData, setTableFormData] = useState({
        tableNumber: '',
        seats: 4,
        resource: '',
    });

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);

    const activeFloor = floors.find(f => f.id === activeFloorId);

    // Selection handlers
    const toggleSelect = (tableId: string) => {
        setSelectedIds(prev =>
            prev.includes(tableId)
                ? prev.filter(id => id !== tableId)
                : [...prev, tableId]
        );
    };

    const selectAll = () => {
        if (!activeFloor) return;
        if (selectedIds.length === activeFloor.tables.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(activeFloor.tables.map(t => t.id));
        }
    };

    // Table handlers
    const toggleTableActive = (tableId: string) => {
        setFloors(prev => prev.map(floor =>
            floor.id === activeFloorId
                ? {
                    ...floor,
                    tables: floor.tables.map(t =>
                        t.id === tableId ? { ...t, isActive: !t.isActive } : t
                    ),
                }
                : floor
        ));
        setIsSaved(false);
    };

    const addTable = () => {
        if (!activeFloor) return;

        const newTable: TableItem = {
            id: `table-${Date.now()}`,
            tableNumber: tableFormData.tableNumber || `${activeFloor.tables.length + 101}`,
            seats: tableFormData.seats,
            isActive: true,
            resource: tableFormData.resource || `Table (Seating ${tableFormData.seats})`,
        };

        setFloors(prev => prev.map(floor =>
            floor.id === activeFloorId
                ? { ...floor, tables: [...floor.tables, newTable] }
                : floor
        ));
        setIsModalOpen(false);
        setTableFormData({ tableNumber: '', seats: 4, resource: '' });
        setIsSaved(false);
    };

    const updateTable = () => {
        if (!editingTable) return;

        setFloors(prev => prev.map(floor =>
            floor.id === activeFloorId
                ? {
                    ...floor,
                    tables: floor.tables.map(t =>
                        t.id === editingTable.id
                            ? { ...t, tableNumber: tableFormData.tableNumber, seats: tableFormData.seats, resource: tableFormData.resource }
                            : t
                    ),
                }
                : floor
        ));
        setEditingTable(null);
        setIsModalOpen(false);
        setTableFormData({ tableNumber: '', seats: 4, resource: '' });
        setIsSaved(false);
    };

    const handleEditTable = (table: TableItem) => {
        setEditingTable(table);
        setTableFormData({
            tableNumber: table.tableNumber,
            seats: table.seats,
            resource: table.resource,
        });
        setIsModalOpen(true);
    };

    // Bulk actions
    const handleDuplicate = () => {
        if (!activeFloor || selectedIds.length === 0) return;

        const duplicates = activeFloor.tables
            .filter(t => selectedIds.includes(t.id))
            .map(t => ({
                ...t,
                id: `table-${Date.now()}-${Math.random()}`,
                tableNumber: `${t.tableNumber}-copy`,
            }));

        setFloors(prev => prev.map(floor =>
            floor.id === activeFloorId
                ? { ...floor, tables: [...floor.tables, ...duplicates] }
                : floor
        ));
        setSelectedIds([]);
        setIsSaved(false);
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) return;
        setConfirmOpen(true);
    };

    const handleBulkDeleteConfirm = () => {
        setFloors(prev => prev.map(floor =>
            floor.id === activeFloorId
                ? { ...floor, tables: floor.tables.filter(t => !selectedIds.includes(t.id)) }
                : floor
        ));
        setSelectedIds([]);
        setIsSaved(false);
    };

    const saveToLocalStorage = () => {
        localStorage.setItem('floor_plan_data_v3', JSON.stringify(floors));
        setIsSaved(true);
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <AdminPageLayout
            title="Floor Plan"
            showSearch={false}
            showNewButton={false}
        >
            <div className="floor-editor-v2">
                {/* Floor Selection */}
                <div className="floor-header">
                    <div className="floor-selector">
                        <label className="floor-selector__label">Select Floor</label>
                        <select
                            className="floor-selector__dropdown"
                            value={activeFloorId}
                            onChange={(e) => {
                                setActiveFloorId(e.target.value);
                                setSelectedIds([]);
                            }}
                        >
                            {FLOOR_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className={`floor-save-btn ${!isSaved ? 'floor-save-btn--unsaved' : ''}`}
                        onClick={saveToLocalStorage}
                        disabled={isSaved}
                    >
                        <Save size={16} />
                        {isSaved ? 'Saved' : 'Save Changes'}
                    </button>
                </div>

                {/* Floor Form Card */}
                {activeFloor && (
                    <div className="floor-form-card">
                        <div className="floor-form-card__header">
                            {hasSelection && (
                                <div className="floor-form-card__selection">
                                    <span className="selection-count">✕ {selectedIds.length} Selected</span>
                                    <div className="selection-actions">
                                        <button className="action-btn" onClick={handleDuplicate}>
                                            <Copy size={14} />
                                            Duplicate
                                        </button>
                                        <button className="action-btn action-btn--danger" onClick={handleBulkDeleteClick}>
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="floor-form-card__body">
                            {/* Tables List */}
                            <div className="tables-section">
                                <div className="tables-section__header">
                                    <h3>{activeFloor.name} Tables</h3>
                                    <button
                                        className="tables-add-btn"
                                        onClick={() => {
                                            setEditingTable(null);
                                            setTableFormData({ tableNumber: '', seats: 4, resource: '' });
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <Plus size={16} />
                                        Add Table
                                    </button>
                                </div>

                                <div className="tables-list">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.length === activeFloor.tables.length && activeFloor.tables.length > 0}
                                                        onChange={selectAll}
                                                    />
                                                </th>
                                                <th>Table Number</th>
                                                <th>Seats</th>
                                                <th>Active</th>
                                                <th>Resource</th>
                                                <th style={{ width: '60px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeFloor.tables.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6}>
                                                        <div className="tables-empty">
                                                            No tables configured. Click "Add Table" to create one.
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                activeFloor.tables.map(table => (
                                                    <tr key={table.id} className={selectedIds.includes(table.id) ? 'row-selected' : ''}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(table.id)}
                                                                onChange={() => toggleSelect(table.id)}
                                                            />
                                                        </td>
                                                        <td><strong>{table.tableNumber}</strong></td>
                                                        <td>{table.seats}</td>
                                                        <td>
                                                            <button
                                                                className={`toggle-switch ${table.isActive ? 'toggle-switch--on' : ''}`}
                                                                onClick={() => toggleTableActive(table.id)}
                                                            >
                                                                <span className="toggle-switch__knob" />
                                                            </button>
                                                        </td>
                                                        <td className="resource-cell">{table.resource}</td>
                                                        <td>
                                                            <button
                                                                className="edit-btn"
                                                                onClick={() => handleEditTable(table)}
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add/Edit Table Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="admin-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="admin-modal"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-modal__header">
                                <h2 className="admin-modal__title">
                                    {editingTable ? 'Edit Table' : 'Add Table'}
                                </h2>
                                <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); editingTable ? updateTable() : addTable(); }}>
                                <div className="admin-modal__body">
                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Table Number</label>
                                        <input
                                            type="text"
                                            className="admin-form__input"
                                            value={tableFormData.tableNumber}
                                            onChange={(e) => setTableFormData({ ...tableFormData, tableNumber: e.target.value })}
                                            placeholder="e.g., 101"
                                            required
                                        />
                                    </div>
                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Number of Seats</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            className="admin-form__input"
                                            value={tableFormData.seats}
                                            onChange={(e) => setTableFormData({ ...tableFormData, seats: parseInt(e.target.value) || 4 })}
                                        />
                                    </div>
                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Resource Name (Optional)</label>
                                        <input
                                            type="text"
                                            className="admin-form__input"
                                            value={tableFormData.resource}
                                            onChange={(e) => setTableFormData({ ...tableFormData, resource: e.target.value })}
                                            placeholder="e.g., Table 1 (Seating 4)"
                                        />
                                    </div>
                                </div>

                                <div className="admin-modal__footer">
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn--secondary"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="admin-btn admin-btn--primary">
                                        {editingTable ? 'Update' : 'Add Table'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .floor-editor-v2 {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .floor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    gap: 1rem;
                }

                .floor-selector {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .floor-selector__label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .floor-selector__dropdown {
                    padding: 0.75rem 1rem;
                    border: 1.5px solid #CBD5E1;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    background: #FAFBFC;
                    min-width: 200px;
                    cursor: pointer;
                }

                .floor-selector__dropdown:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    background: white;
                }

                .floor-save-btn {
                    padding: 0.75rem 1.25rem;
                    border-radius: 8px;
                    border: none;
                    background: #e5e7eb;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                }

                .floor-save-btn--unsaved {
                    background: #009688;
                    color: white;
                }

                .floor-save-btn:disabled {
                    cursor: not-allowed;
                }

                .floor-form-card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: var(--shadow-card);
                    overflow: hidden;
                }

                .floor-form-card__header {
                    min-height: 0;
                }

                .floor-form-card__selection {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1.5rem;
                    background: #1F2937;
                    color: white;
                }

                .selection-count {
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .selection-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .action-btn {
                    padding: 0.4rem 0.75rem;
                    border-radius: 6px;
                    border: none;
                    background: #374151;
                    color: white;
                    font-size: 0.8rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                .action-btn:hover {
                    background: #4B5563;
                }

                .action-btn--danger {
                    background: #DC2626;
                }

                .action-btn--danger:hover {
                    background: #B91C1C;
                }

                .floor-form-card__body {
                    padding: 1.5rem;
                }

                .tables-section__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .tables-section__header h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .tables-add-btn {
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    border: none;
                    background: #009688;
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                .tables-add-btn:hover {
                    background: #00796B;
                }

                .tables-list {
                    border: 1px solid var(--border-light);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .tables-list table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .tables-list th,
                .tables-list td {
                    padding: 0.75rem 1rem;
                    text-align: left;
                    border-bottom: 1px solid var(--border-light);
                }

                .tables-list th {
                    background: #f9fafb;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .tables-list tbody tr:hover {
                    background: #f9fafb;
                }

                .tables-list tbody tr.row-selected {
                    background: #E0F2F1;
                }

                .tables-list input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: var(--primary-color);
                }

                .tables-empty {
                    text-align: center;
                    padding: 2rem;
                    color: var(--text-muted);
                }

                .resource-cell {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                .toggle-switch {
                    width: 44px;
                    height: 24px;
                    border-radius: 12px;
                    border: none;
                    background: #E5E7EB;
                    cursor: pointer;
                    position: relative;
                    transition: background 0.2s;
                }

                .toggle-switch--on {
                    background: #10B981;
                }

                .toggle-switch__knob {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    transition: left 0.2s;
                }

                .toggle-switch--on .toggle-switch__knob {
                    left: 22px;
                }

                .edit-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    border: 1px solid var(--border-light);
                    background: white;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .edit-btn:hover {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                }

                @media (max-width: 768px) {
                    .floor-header {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .floor-selector__dropdown {
                        width: 100%;
                    }
                }
            `}</style>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleBulkDeleteConfirm}
                type="delete"
                title="Delete Tables"
                message={`Are you sure you want to delete ${selectedIds.length} table(s)? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
        </AdminPageLayout>
    );
};

export default FloorEditor;
