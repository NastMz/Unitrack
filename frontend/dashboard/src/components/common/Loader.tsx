/**
 * Loader component.
 *
 * This component is the loader of the application.
 *
 * @returns {JSX.Element} - The rendered component.
 */
export const Loader = () => {
    return (
        <div className={'flex h-screen w-screen items-center justify-center'}>
            <span className="loader-home"></span>
        </div>
    );
}