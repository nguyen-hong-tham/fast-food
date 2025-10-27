import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1 items-center justify-center px-6">
            <Image 
              source={images.emptyState}
              className="w-48 h-48 mb-6"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-gray-800 mb-2 text-center">
              Oops! Something went wrong
            </Text>
            <Text className="text-base text-gray-500 text-center mb-2">
              We encountered an unexpected error
            </Text>
            {__DEV__ && this.state.error && (
              <Text className="text-sm text-red-500 text-center mb-6 px-4">
                {this.state.error.message}
              </Text>
            )}
            <TouchableOpacity
              className="bg-primary px-8 py-4 rounded-xl"
              onPress={this.handleReset}
            >
              <Text className="text-white font-bold text-base">Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
