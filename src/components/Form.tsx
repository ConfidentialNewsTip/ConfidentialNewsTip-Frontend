
import { useState } from "react"


const Form = ({formLoadingStep, setFormLoadingStep,  showCreateModal, setShowCreateModal, handleCreateNews, setShowMainContent}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    return (
        <div>
            {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] border border-[#FFEB3B]/30 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create News</h3>
              <button
                onClick={() => {setShowCreateModal(false); setShowMainContent(true)}}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter news title"
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-gray-600 rounded-lg text-white focus:border-[#FFEB3B] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter news description"
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-gray-600 rounded-lg text-white focus:border-[#FFEB3B] focus:outline-none"
                />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {setShowCreateModal(false); setShowMainContent(true)}}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 btn-primary"
                onClick={() => {
                    setFormLoadingStep("loading")
                    handleCreateNews(title, description)
                }}
                >
                  {formLoadingStep === "idle" && 'Create News'}
                  {formLoadingStep === "loading" && 'Creating News...'}
                  {formLoadingStep === "success" && 'Create News Success ✅'}
                </button>
              </div>
            </div>
          </div>
        
            )}
        </div>
    )
}
export default Form;

