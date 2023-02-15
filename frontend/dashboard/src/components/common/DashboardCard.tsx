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
export const DashboardCard = () => {
  return (
    <div className={'flex flex-col items-center justify-center h-full w-full'}>
        {icon}
        <h3 className={'text-xl font-bold mt-4'}>{title}</h3>
    </div>
  )
}