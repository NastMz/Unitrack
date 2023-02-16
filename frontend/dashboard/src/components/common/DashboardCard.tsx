import {useEffect, useState} from "react";

/**
 * Interface for the DashboardCard component props.
 *
 * @param {JSX.Element} icon - The icon to be rendered.
 * @param {number} count - The count of records to be displayed.
 * @param {string} title - The title of the card.
 * @param {string} bgColor - The background color of the card in hex format. (The color of the text is white).
 * @param {() => void} onClick - The function to be executed when the card is clicked.
 */
export interface DashboardCardProps {
    icon: JSX.Element;
    count: number;
    title: string;
    bgColor: string;
    onClick?: () => void;
}

/**
 * DashboardCard component.
 *
 * This component is used to render a card on the dashboard.
 *
 * @returns {JSX.Element} - The component.
 */
export const DashboardCard = ({icon, count, title, bgColor, onClick}: DashboardCardProps) => {
    const [animatedCount, setAnimatedCount] = useState(0);

    useEffect(() => {
        let animationFrameId: number;

        const animateCount = () => {
            if (animatedCount < count) {
                setAnimatedCount(animatedCount + 1);
                animationFrameId = requestAnimationFrame(animateCount);
            }
        };

        animationFrameId = requestAnimationFrame(animateCount);

        return () => cancelAnimationFrame(animationFrameId);
    }, [animatedCount, count]);

    return (
        <div
            className={'flex flex-col items-center justify-center gap-4 h-full w-36 p-6 rounded-xl shadow-xl text-white cursor-pointer hover:scale-105 transition-all duration-300 ease-in-out transform hover:shadow-2xl hover:z-10'}
            style={{
                backgroundColor: bgColor,
            }}
            onClick={onClick}
        >
            <div className={'text-2xl font-medium'}>
                {animatedCount}
            </div>
            <div className={'flex flex-col items-center justify-center gap-2'}>
                <div className={'text-3xl font-bold'}>
                    {icon}
                </div>
                <h3 className={'text-xl font-bold'}>{title}</h3>
            </div>
        </div>
    );
};
