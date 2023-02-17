import {useState} from "react";
import ReactPaginate from "react-paginate";

/**
 * Interface for the Table component props.
 *
 * @interface TableProps
 * @property {Record<string, string>} headersMap - The map of headers to display.
 * @param {any[]} data - The data for the table.
 * @param {(context: 'create' | 'edit') => void} setContext - The function to set the context for the form.
 * @param {(value: boolean) => void} setShowForm - The function to set the show form state.
 * @param {(record: any) => void} setSelectedRecord - The function to set the selected record.
 * @param {(record: any) => void} deleteRecord - The function to delete a record.
 * @param {number} itemsPerPage - The number of items to show per page.
 */
export interface TableProps {
    headersMap: Record<string, string>;
    data: any[];
    setContext: (context: 'create' | 'edit') => void;
    setShowForm: (value: boolean) => void;

    setSelectedRecord: (record: any) => void;

    deleteRecord: (record: any) => void;
    itemsPerPage: number;
}

/**
 * Table component.
 *
 * This component is used to render a table.
 * @param {TableProps} props - The props for the component.
 */
export const Table = ({
                          headersMap,
                          data,
                          setContext,
                          setShowForm,
                          setSelectedRecord,
                          deleteRecord,
                          itemsPerPage
                      }: TableProps) => {

    const handleEdit = (record: any) => {
        setSelectedRecord(record);
        setContext('edit');
        setShowForm(true);
    }

    const handleAdd = () => {
        setContext('create');
        setShowForm(true);
    }

    //////////////////////// PAGINATION ////////////////////////

    // State for pagination
    const [itemOffset, setItemOffset] = useState(0);

    // Pagination limit
    const endOffset = itemOffset + itemsPerPage;

    // Items to show in actual page
    const currentItems = data.slice(itemOffset, endOffset);

    // Number of pages for pagination
    const pageCount = Math.ceil(data.length / itemsPerPage);

    // Change active page
    const handlePageClick = (event: { selected: number; }) => {
        const newOffset = (event.selected * itemsPerPage) % data.length;
        setItemOffset(newOffset);
    };

    return (
        <div
            className={'w-full h-full bg-slate-100 p-8 flex flex-col justify-between'}>
            <button
                className={'absolute top-16 right-12 bg-sky-400 hover:bg-sky-500 px-4 py-2 rounded-md text-white'}
                onClick={() => handleAdd()}
            >
                Añadir
            </button>
            <div className={'w-full overflow-x-auto'}>
                <table
                    className="min-w-full text-start table-fixed rounded-md border border-slate-200 shadow-md">
                    <colgroup>
                        {Object.keys(headersMap).map((key) => (
                            <col key={key} className="w-auto"/>
                        ))}
                        <col className="w-1/6"/>
                    </colgroup>
                    <thead className={'bg-slate-50 border-b border-slate-200'}>
                    <tr>
                        {
                            Object.values(headersMap).map((header, index) => {
                                return <th key={index}
                                           className={'px-6 py-3 text-left text-sm font-medium text-slate-900'}>{header}</th>
                            })
                        }
                        <th className={'px-6 py-3 text-center text-sm font-medium text-slate-900'}>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        currentItems.map((row, index) => {
                            return (
                                <tr key={index} className="odd:bg-white even:bg-slate-50">
                                    {
                                        Object.keys(headersMap).map((key, index) => {
                                            const value = row[key];
                                            return <td key={index}
                                                       className={'px-6 py-4 whitespace-nowrap text-sm text-slate-600'}>{value}</td>
                                        })
                                    }
                                    <td className={'flex gap-8 py-2 px-4'}>
                                    <span
                                        className={'text-main-500 hover:text-main-600 cursor-pointer'}
                                        onClick={() => handleEdit(row)}
                                    >
                                        Editar
                                    </span>
                                        <span
                                            className={'text-red-500 hover:text-main-600 cursor-pointer'}
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
            <div className={'w-full flex justify-center'}>
                {
                    pageCount > 0 && (
                        <ReactPaginate
                            forcePage={0}
                            breakLabel="..."
                            nextLabel="Siguiente"
                            onPageChange={handlePageClick}
                            pageRangeDisplayed={3}
                            pageCount={pageCount}
                            previousLabel="Anterior"
                            containerClassName={"h-fit flex gap-2 items-center justify-center px-8 font-medium text-sm text-slate-700"}
                            pageLinkClassName={"bg-white h-4 w-4 p-4 flex items-center justify-center border-2 hover:border-main-600 rounded-md"}
                            activeLinkClassName={"border-main-600"}
                            previousLinkClassName={"bg-white h-4 w-fit p-4 flex items-center border-2 border-slate-200 hover:border-main-600 rounded-md"}
                            nextLinkClassName={"bg-white h-4 w-fit p-4 flex items-center border-2 border-slate-200 hover:border-main-600 rounded-md"}
                            breakLinkClassName={"text-sm text-slate-300"}
                            previousClassName={"flex-1"}
                            nextClassName={"flex-1 flex justify-end"}
                            disabledClassName={"pointer-events-none"}
                        />
                    )
                }
            </div>
        </div>
    )
}