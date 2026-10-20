import { Component, type ErrorInfo, type ReactNode } from 'react';
import ServerDownScreen from './ServerDownScreen';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // зачем: если произошла ошибка — показываем заглушку
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <ServerDownScreen />;
    }

    return this.props.children;
  }
}