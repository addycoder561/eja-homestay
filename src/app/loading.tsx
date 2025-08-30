export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8">
          <div className="relative flex items-center justify-center mx-auto animate-pulse">
            <img 
              src="/eja_02.svg" 
              alt="EJA Logo" 
              className="w-[225px] h-[225px]"
            />
            <div className="absolute inset-0 bg-white/20 rounded-2xl animate-ping" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading EJA</h2>
        <p className="text-gray-600 mb-8">Preparing your perfect travel experience...</p>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-yellow-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin"></div>
            </div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Loading Tips */}
        <div className="mt-8 text-sm text-gray-500">
          <p>💡 Tip: While you wait, explore our popular destinations</p>
        </div>
      </div>
    </div>
  );
}
