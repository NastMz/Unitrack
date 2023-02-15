/**
 * WavesIcon component.
 *
 * This component renders the waves icon used to indicate the user location.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const WavesIcon = () => {
    return (
        <div className="relative flex justify-center items-center">
            <div
                className={'h-2 w-2 bg-white z-50 rounded-full absolute top-50 left-50 transform-translate-x-50 transform-translate-y-50'}/>
            <div
                className={'h-4 w-4 bg-main-600 z-40 rounded-full absolute top-50 left-50 transform-translate-x-50 transform-translate-y-50 opacity-80'}/>
            <div
                className={'h-6 w-6 bg-main-500 z-30 rounded-full absolute top-50 left-50 transform-translate-x-50 transform-translate-y-50 opacity-60'}/>
            <div
                className={'h-8 w-8 bg-main-400 z-20 rounded-full absolute top-50 left-50 transform-translate-x-50 transform-translate-y-50 opacity-40'}/>
        </div>
    );
};

