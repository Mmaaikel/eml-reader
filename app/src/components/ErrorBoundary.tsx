import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
	/** When this value changes, a caught error is cleared and the children render again */
	resetKey?: unknown
	fallback: (error: Error) => ReactNode
	children: ReactNode
}

interface State {
	error: Error | null
}

/** Catches render errors below it so one bad email can't blank the whole page. */
export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null }

	static getDerivedStateFromError(error: unknown): State {
		return { error: error instanceof Error ? error : new Error(String(error)) }
	}

	componentDidCatch(error: unknown, info: ErrorInfo) {
		console.error('Render error', error, info.componentStack)
	}

	componentDidUpdate(previous: Props) {
		if (this.state.error && previous.resetKey !== this.props.resetKey) {
			this.setState({ error: null })
		}
	}

	render() {
		return this.state.error ? this.props.fallback(this.state.error) : this.props.children
	}
}
