/**
 * Interface for the DashboardCard component props.
 *
 * @param {JSX.Element} icon - The icon to be rendered.
 * @param {string} title - The title of the card.
 * @param {string} bgColor - The background color of the card.
 */
export interface DashboardCardProps {
    icon: JSX.Element,
    title: string,
    bgColor: string,
}

/**
 * DashboardCard component.
 *
 * This component is used to render a card on the dashboard.
 *
 * @returns {JSX.Element} - The component.
 */
export const DashboardCard = ({icon, title, bgColor}: DashboardCardProps) => {
    return (
        <div
            className={'flex flex-col items-center justify-center h-full w-full p-6 rounded-xl shadow-xl'}
             style={{
                backgroundColor: bgColor
             }}
        >
            {icon}
            <h3 className={'text-xl font-bold mt-4'}>{title}</h3>
        </div>
    )
}