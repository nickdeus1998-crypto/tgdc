interface SideTabProps {
  isVisible: boolean;
  onClick: () => void;
}

const SideTab: React.FC<SideTabProps> = ({ isVisible, onClick }) => {
  return (
    <div className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-40 ${isVisible ? 'block slide-in-tab' : 'hidden'}`}>
      <div
        className="bg-gradient-to-b from-primary-green via-secondary-green to-primary-green text-white rounded-l-3xl shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-translate-x-2 gradient-border"
        onClick={onClick}
      >
        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-orange-400 to-yellow-400 rounded-l-full animate-pulse"></div>
        <div className="relative p-5 pr-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 float">
              <svg className="w-6 h-6 text-yellow-300 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <span className="text-xs font-bold transform rotate-90 whitespace-nowrap tracking-wider">3 UPDATES</span>
              <div className="w-8 h-px bg-white/50"></div>
              <span className="text-xs font-semibold transform rotate-90 whitespace-nowrap text-yellow-200">NEWS</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-3 h-3 bg-red-500 rounded-full notification-ping relative"></div>
              <div className="text-xs font-bold">NEW</div>
            </div>
            <div className="flex flex-col space-y-1">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>
        </div>
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SideTab;