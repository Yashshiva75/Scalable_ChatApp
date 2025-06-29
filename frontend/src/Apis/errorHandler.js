export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { message: data.message || 'Bad request' };
      case 401:
        return { message: 'Unauthorized access' };
      case 403:
        return { message: 'Access forbidden' };
      case 404:
        return { message: 'Resource not found' };
      case 500:
        return { message: 'Server error. Please try again later.' };
      default:
        return { message: data.message || 'Something went wrong' };
    }
  } else if (error.request) {
    // Network error
    return { message: 'Network error. Check your connection.' };
  } else {
    // Other error
    return { message: error.message || 'An unexpected error occurred' };
  }
};

export const showErrorToast = (error) => {
  const errorMessage = handleApiError(error);
  // You can integrate with toast library here
  console.error('API Error:', errorMessage.message);
  return errorMessage;
};