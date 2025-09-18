import App from '@/App'
import Program from '@/pages/about-program/program'
import LoginForm from '@/pages/Auth/login'
import Dashboard from '@/pages/dashboard/dashboard'
import Depos from '@/pages/depos/depos'
import Tch1 from '@/pages/depos/tch-1/tch1'
import Tch2 from '@/pages/depos/tch-2/tch2'
import DepTable from '@/pages/royxatga-olish/deponi-royxatlas/deponi-royxatlash'
import Ehtiyotqismlari from '@/pages/royxatga-olish/ehtiyot-qismlari/ehtiyot-qismlari'
import Harakattarkibi from '@/pages/royxatga-olish/harakat-tarkibi/harakat-tarkibi'
import TamirlashTuri from "@/pages/royxatga-olish/ta'mirlash-turi/tamirlash-turi"
import NosozAdd from '@/pages/texnik-korik-jurnali/nosozAdd/nosozAdd'
import TexnikAdd from '@/pages/texnik-korik-jurnali/texnikAdd/TexnikAdd'
import TexnikAddDetails from '@/pages/texnik-korik-jurnali/texnikAdd/texnikAddDetails'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ path: '/deponi-royxatga-olish', element: <DepTable /> },
			{ path: '/', element: <Dashboard /> },
			{ path: '/depo-chilonzor', element: <Tch1 /> },
			{ path: '/depo-ozbekiston', element: <Tch2 /> },
			{ path: '/dastur-haqida', element: <Program /> },
			{
				path: '/ehtiyot-qismlarini-royxatga-olish',
				element: <Ehtiyotqismlari />,
			},
			{
				path: '/harakat-tarkibini-royxatga-olish',
				element: <Harakattarkibi />,
			},
			{
				path: '/tamirlash-turi-royxatga-olish',
				element: <TamirlashTuri />,
			},
			{
				path: '/depo/:id/',
				element: <Depos />,
			},
			{
				path: "/texnik-ko'rik-qoshish",
				element: <TexnikAdd />,
			},
			{
				path: '/nosozliklar-qoshish',
				element: <NosozAdd />,
			},
			{
				path: "texnik-ko'rik-qoshish/texnik-korik-details/:ide/",
				element: <TexnikAddDetails />,
			},
		],
	},
	{ path: '/login', element: <LoginForm /> },
	//   { path: "*", element: <NotFound /> },
])
