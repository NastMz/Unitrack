import {Link} from "react-router-dom";

interface SidebarCardProps {
    to: string,
    icon: JSX.Element,
    name: string,
    isActive: boolean,
}
export const SidebarCard = (props: SidebarCardProps) => {
  return (
      <Link to={props.to} className={`flex gap-2 items-center px-4 py-2 font-medium text-lg rounded-md hover:text-main-600 hover:bg-slate-100 ${props.isActive ? 'text-main-600 bg-slate-100' : 'text-slate-400'}`}>
          {props.icon}
          <span className={''}>{props.name}</span>
      </Link>
  )
}