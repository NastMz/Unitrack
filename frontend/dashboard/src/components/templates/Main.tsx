import {Sidebar} from "../ui";

/**
 * Interface for the Main component.
 *
 * @param {JSX.Element} page - The page to be rendered.
 * @param {string} title - The title of the page.
 * @param {string} pageName - The name of the page.
 */
interface MainProps {
    page: JSX.Element,
    title: string,
    pageName: string,
}

/**
 * Main component.
 *
 * This component is used to render the pages.
 *
 * @param {MainProps} props - The props for the component.
 * @returns {JSX.Element} - The component.
 */
export const Main = (props: MainProps) => {
    document.title = props.title;

    return (
        <div className={"h-screen max-h-screen flex"}>
            <Sidebar className={'flex-shrink'}/>
            <main className={'flex flex-col px-12 py-8 flex-grow'}>
                <h2 className={'font-bold text-3xl flex-shrink mb-8'}>{props.pageName}</h2>
                <div className={'flex items-center justify-center flex-grow'}>
                    {props.page}
                </div>
            </main>
        </div>
    )
}