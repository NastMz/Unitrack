/**
 * Interface for the Table component props.
 *
 * @param {string[]} headers - The headers for the table.
 * @param {any[]} data - The data for the table.
 * @param {(context: 'create' | 'edit') => void} setContext - The function to set the context for the form.
 * @param {(value: boolean) => void} setShowForm - The function to set the show form state.
 * @param {(record: any) => void} setSelectedRecord - The function to set the selected record.
 * @param {(record: any) => void} deleteRecord - The function to delete a record.
 */
export interface TableProps {
    headers: string[];
    data: any[];
    setContext: (context: 'create' | 'edit') => void;
    setShowForm: (value: boolean) => void;

    setSelectedRecord: (record: any) => void;

    deleteRecord: (record: any) => void;
}

/**
 * Table component.
 *
 * This component is used to render a table.
 * @param {TableProps} props - The props for the component.
 */
export const Table = ({headers, data, setContext, setShowForm, setSelectedRecord, deleteRecord}: TableProps) => {

    const handleEdit = (record: any) => {
        setSelectedRecord(record);
        setContext('edit');
        setShowForm(true);
    }

    const handleAdd = () => {
        setContext('create');
        setShowForm(true);
    }

    return (
        <div className={'overflow-x-auto w-full h-full flex justify-center items-start bg-slate-100 p-8'}>
            <button
                className={'absolute top-16 right-12 bg-sky-400 hover:bg-sky-500 px-4 py-2 rounded-md text-white'}
                onClick={() => handleAdd()}
            >
                Añadir
            </button>
            <table className="min-w-full max-h-full text-start table-fixed rounded-md border border-slate-200 shadow-md">
                <colgroup>
                    {headers.map((_, index) => (
                        <col key={index} className="w-auto" />
                    ))}
                    <col className="w-1/6" />
                </colgroup>
                <thead className={'bg-slate-50 border-b border-slate-200'}>
                <tr>
                    {
                        headers.map((header, index) => {
                            return <th key={index} className={'px-6 py-3 text-left text-sm font-medium text-slate-900'}>{header}</th>
                        })
                    }
                    <th className={'px-6 py-3 text-center text-sm font-medium text-slate-900'}>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {
                    data.map((row, index) => {
                        return (
                            <tr key={index} className="odd:bg-white even:bg-slate-50">
                                {
                                    Object.values(row).map((value: any, index) => {
                                        return <td key={index} className={'px-6 py-4 whitespace-nowrap text-sm text-slate-600'}>{value}</td>
                                    })
                                }
                                <td className={'flex gap-8 py-2 px-4'}>
                                    <span
                                        className={'text-main-500 cursor-pointer'}
                                        onClick={() => handleEdit(row)}
                                    >
                                        Editar
                                    </span>
                                    <span
                                        className={'text-red-500 cursor-pointer'}
                                        onClick={() => deleteRecord(row)}
                                    >
                                        Eliminar
                                    </span>
                                </td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        </div>
    )
}