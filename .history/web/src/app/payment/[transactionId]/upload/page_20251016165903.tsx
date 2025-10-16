"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/libs/api';
import { toast } from 'sonner';
import { 
  Upload,
  Camera,
  FileImage,
  X,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  RotateCcw
} from 'lucide-react';

export default function UploadProofPage({ params }: { params: { transactionId: string } }) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('paymentProof', selectedFile);
      
      const response = await api.transactions.uploadPaymentProof(params.transactionId, formData);
      
      if (response.data?.success) {
        toast.success('Payment proof uploaded successfully! 🎉');
        router.push(`/payment/${params.transactionId}/success`);
      } else {
        throw new Error(response.data?.message || 'Failed to upload payment proof');
      }
    } catch (error: any) {
      console.error('Failed to upload payment proof:', error);
      toast.error(error.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-3 glassmorphism rounded-full hover:scale-110 transition-all"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white">Upload Payment Proof</h1>
            <p className="text-gray-300 mt-2">Upload a clear photo of your transfer receipt</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Instructions */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Camera className="text-purple-400" />
                Photo Guidelines
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-white font-semibold">Good Photo</h3>
                      <p className="text-gray-400 text-sm">Clear, well-lit, all text visible</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-white font-semibold">Complete Receipt</h3>
                      <p className="text-gray-400 text-sm">Shows amount, date, and bank details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-white font-semibold">Correct Format</h3>
                      <p className="text-gray-400 text-sm">JPG, PNG, or WebP under 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <X className="text-red-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-white font-semibold">Blurry Photos</h3>
                      <p className="text-gray-400 text-sm">Text must be readable</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="text-red-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-white font-semibold">Partial Screenshots</h3>
                      <p className="text-gray-400 text-sm">Must show complete transaction</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="text-red-400 mt-1" size={20} />
                    <div>
                      <h3 className="text-white font-semibold">Wrong Amount</h3>
                      <p className="text-gray-400 text-sm">Amount must match exactly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="glassmorphism rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Upload className="text-purple-400" />
                Upload Your Receipt
              </h2>

              {!selectedFile ? (
                <div
                  className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    <FileImage className="mx-auto text-gray-400" size={64} />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Drag & drop your receipt here
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Or click to browse from your device
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Upload size={20} />
                        Choose File
                      </button>
                      
                      <button
                        onClick={() => {
                          // In a real app, this would open camera
                          fileInputRef.current?.click();
                        }}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Camera size={20} />
                        Take Photo
                      </button>
                    </div>
                    
                    <p className="text-gray-500 text-sm">
                      Supported formats: JPG, PNG, WebP • Max size: 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Preview */}
                  <div className="relative">
                    <div className="relative w-full rounded-2xl overflow-hidden bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl!}
                        alt="Payment proof preview"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => window.open(previewUrl!, '_blank')}
                          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={removeFile}
                          className="p-2 bg-red-500/50 hover:bg-red-500/70 text-white rounded-full transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileImage className="text-purple-400" size={24} />
                      <div>
                        <p className="text-white font-semibold">{selectedFile.name}</p>
                        <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </div>

                  {/* Upload Button */}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={20} />
                        Upload Payment Proof
                      </>
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Tips & Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Tips Card */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="text-yellow-400" />
                  Tips for Better Photos
                </h3>
                
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <p className="text-gray-300 text-sm">
                      Use good lighting - avoid shadows on the receipt
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <p className="text-gray-300 text-sm">
                      Keep the phone steady to avoid blur
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <p className="text-gray-300 text-sm">
                      Capture the entire receipt in the frame
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <p className="text-gray-300 text-sm">
                      Make sure all text is clearly readable
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <p className="text-gray-300 text-sm">
                      Double-check the transfer amount matches
                    </p>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-400" />
                  What Happens Next?
                </h3>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                      1
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Upload Confirmation</p>
                      <p className="text-gray-400 text-xs">You&apos;ll receive immediate confirmation</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                      2
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Payment Review</p>
                      <p className="text-gray-400 text-xs">We&apos;ll verify within 3 business days</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                      3
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Ticket Delivery</p>
                      <p className="text-gray-400 text-xs">Your tickets will be sent via email</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="glassmorphism rounded-3xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Having trouble uploading? Our support team is here to help.
                </p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
