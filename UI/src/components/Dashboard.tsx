import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, Link as LinkIcon, Settings } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900">OpenMCA Tools</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium text-gray-900">{user?.phoneNumber}</span>
              </div>
              <button
                onClick={() => logout()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to your OpenMCA Tools dashboard. Get started by exploring the tools and features available to you.
          </p>
        </div>

        {/* Placeholder Links */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-xl font-semibold text-gray-900">Statement Analysis</h3>
            </div>
            <p className="text-gray-600 mb-6">
              PDF highight, repeating transactions etc
            </p>
            <a href='/' className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              Open
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="ml-3 text-xl font-semibold text-gray-900">Ending balances</h3>
            </div>
            <p className="text-gray-600 mb-6">
             Get ending balances from statement
            </p>
            <a href='/ending-balances' className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
              Coming Soon
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;