import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Settings, Database } from 'lucide-react';
import UserManagement from './UserManagement';
import SystemManagement from './SystemManagement';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="bg-[#f0f4f8] min-h-screen py-8 px-4 flex justify-center font-sans">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-6">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 p-4 sticky top-24">
            <div className="mb-6 p-4 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">TRANG QUẢN TRỊ</span>
              <h1 className="text-lg font-bold text-gray-800 leading-tight truncate">Hi, {user?.name || 'Admin'}</h1>
            </div>
            
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium transition ${activeTab === 'users' ? 'bg-[#0096ff] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Users size={18} className={activeTab === 'users' ? 'text-white' : 'text-gray-400'} />
                Quản lý User
              </button>
              
              <button 
                onClick={() => setActiveTab('system')}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium transition ${activeTab === 'system' ? 'bg-[#0096ff] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Database size={18} className={activeTab === 'system' ? 'text-white' : 'text-gray-400'} />
                Dữ liệu hệ thống
              </button>

              <button 
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-medium transition ${activeTab === 'config' ? 'bg-[#0096ff] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Settings size={18} className={activeTab === 'config' ? 'text-white' : 'text-gray-400'} />
                Cấu hình chung
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 p-6 md:p-8 min-h-[500px]">
             {activeTab === 'users' && <UserManagement />}
             {activeTab === 'system' && <SystemManagement />}
             {activeTab === 'config' && (
                <div className="text-center py-20 text-gray-500">
                  <Settings size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Cấu hình chung</h3>
                  <p>Module chưa được kích hoạt. Vui lòng liên hệ nhà phát triển.</p>
                </div>
             )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;
