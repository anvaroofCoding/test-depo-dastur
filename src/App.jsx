import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AppleSidebar } from './Main/sidebarMain'
import LoginForm from './pages/Auth/login'

export default function App() {
	const navigate = useNavigate()
	const [token, setToken] = useState(localStorage.getItem('tokens'))
	// const { data, isLoading, isError } = useGetDepQuery()

	useEffect(() => {
		const interval = setInterval(() => {
			const newToken = localStorage.getItem('tokens')
			setToken(newToken)
			// if (error)
			if (!newToken) {
				navigate('/login')
			}
		}, 3000)

		return () => clearInterval(interval)
	}, [navigate])

	// if (isLoading)
	// 	return (
	// 		<div className='w-full h-screen flex justify-center items-center'>
	// 			<Loading />
	// 		</div>
	// 	)

	// if (isError) return navigate("/login");

	if (!token) {
		return <LoginForm />
	}

	return (
		<div className='flex h-screen overflow-hidden'>
			<AppleSidebar />
			<div className='w-full overflow-y-scroll'>
				<Outlet />
			</div>
		</div>
	)
}
