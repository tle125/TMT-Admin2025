import React, { useEffect, useState, useRef } from 'react';
import type { Employee } from '../types';
import { XIcon, CameraIcon, UploadIcon } from '../constants';
import { EmployeeImage } from './EmployeeImage';
import { useLocalization } from '../contexts/LocalizationContext';

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  onClose: () => void;
  onSaveNewPhoto: (employee: Employee, newPhotoDataUrl: string) => Promise<void>;
}

const DetailItem = ({ label, value }: { label: string; value: string | undefined }) => (
  <div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-sm text-slate-900">{value || '-'}</p>
  </div>
);

export const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({ employee, onClose, onSaveNewPhoto }) => {
  const { t } = useLocalization();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isCameraOpen) {
          setIsCameraOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, isCameraOpen]);

  useEffect(() => {
    if (!isCameraOpen) {
      return;
    }

    let stream: MediaStream | null = null;
    const video = videoRef.current;

    const startCamera = async () => {
      setPhotoError(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           throw new Error(t('cameraErrors.notSupported'));
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (video) {
          video.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        if (err instanceof DOMException) {
            switch(err.name) {
                case 'NotFoundError':
                    setPhotoError(t('cameraErrors.notFound'));
                    break;
                case 'NotAllowedError':
                    setPhotoError(t('cameraErrors.notAllowed'));
                    break;
                case 'NotReadableError':
                    setPhotoError(t('cameraErrors.notReadable'));
                    break;
                default:
                    setPhotoError(t('cameraErrors.generic', { message: err.message }));
            }
        } else {
            setPhotoError(err instanceof Error ? err.message : t('cameraErrors.unknown'));
        }
      }
    };

    startCamera();

    return () => { 
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (video) {
        video.srcObject = null;
      }
    };
  }, [isCameraOpen, t]);
  
  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && employee && !photoError) {
        const context = canvas.getContext('2d');
        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUrl = canvas.toDataURL('image/png');
            
            setIsSaving(true);
            setPhotoError(null);
            try {
                await onSaveNewPhoto(employee, dataUrl);
                setIsCameraOpen(false); 
            } catch (error) {
                setPhotoError(t('cameraErrors.saveFailed'));
                console.error("Save photo failed:", error);
            } finally {
                setIsSaving(false);
            }
        }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !employee) return;
    
    event.target.value = '';

    if (!file.type.startsWith('image/')) {
      setPhotoError(t('cameraErrors.invalidFileType'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      
      setIsSaving(true);
      setPhotoError(null);
      try {
        await onSaveNewPhoto(employee, dataUrl);
      } catch (error) {
        setPhotoError(t('cameraErrors.uploadFailed'));
        console.error("Save uploaded photo failed:", error);
      } finally {
        setIsSaving(false);
      }
    };
    reader.onerror = () => {
      setIsSaving(false);
      setPhotoError(t('cameraErrors.fileReadFailed'));
    };
    reader.readAsDataURL(file);
  };

  if (!employee) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {isCameraOpen ? (
            <div className="p-6">
                <h2 id="modal-title" className="text-xl font-bold text-slate-900 text-center mb-4">
                    {t('updatePhotoTitle')}
                </h2>
                <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                {photoError && <p className="mt-4 text-center text-sm text-red-600">{photoError}</p>}
                <div className="mt-6 flex justify-center space-x-4">
                    <button 
                        onClick={handleCapture}
                        disabled={isSaving || !!photoError}
                        className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? t('saving') : t('capture')}
                    </button>
                    <button 
                        onClick={() => setIsCameraOpen(false)}
                        disabled={isSaving}
                        className="inline-flex items-center px-6 py-2 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {t('cancel')}
                    </button>
                </div>
            </div>
        ) : (
        <>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h2 id="modal-title" className="text-xl font-bold text-slate-900">
                    {t('employeeDetailsTitle')}
                    </h2>
                    <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Close modal"
                    >
                    <XIcon />
                    </button>
                </div>
            </div>

            <div className="px-6 pb-8">
                <div className="text-center mb-6 -mt-2">
                    <EmployeeImage 
                        photoId={employee.photoId} 
                        fullName={employee.fullName}
                        className="h-32 w-32 rounded-full object-cover mx-auto ring-4 ring-white shadow-lg"
                        wrapperClassName="h-32 w-32 bg-slate-200 rounded-full flex items-center justify-center mx-auto ring-4 ring-white shadow-lg"
                        iconClassName="h-20 w-20 text-slate-400"
                    />
                    <h3 className="mt-4 text-lg leading-6 font-bold text-slate-900">{employee.fullName}</h3>
                    <p className="text-sm text-indigo-600">{employee.position}</p>
                     <div className="mt-4">
                        {isSaving ? (
                            <div className="flex items-center justify-center text-sm text-slate-600 h-[34px]">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                                {t('saving')} photo...
                            </div>
                        ) : (
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => {
                                        setPhotoError(null);
                                        setIsCameraOpen(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <CameraIcon />
                                    <span className="ml-2">{t('takePhoto')}</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <UploadIcon />
                                    <span className="ml-2">{t('uploadPhoto')}</span>
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            className="hidden"
                        />
                        {photoError && !isCameraOpen && <p className="mt-2 text-sm text-red-600">{photoError}</p>}
                    </div>
                </div>
                
                <div className="border-t border-slate-200 pt-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                        <DetailItem label={t('modalLabels.employeeId')} value={employee.employeeId} />
                        <DetailItem label={t('modalLabels.nickname')} value={employee.nickname} />
                        <DetailItem label={t('modalLabels.department')} value={employee.department} />
                        <DetailItem label={t('modalLabels.section')} value={employee.section} />
                        <DetailItem label={t('modalLabels.startDate')} value={employee.startDate ? new Date(employee.startDate).toLocaleDateString() : '-'} />
                        <DetailItem label={t('modalLabels.dob')} value={employee.dob ? new Date(employee.dob).toLocaleDateString() : '-'} />
                        <DetailItem label={t('modalLabels.gender')} value={employee.gender} />
                        <DetailItem label={t('modalLabels.religion')} value={employee.religion} />
                        <DetailItem label={t('modalLabels.phone')} value={employee.phone} />
                        <DetailItem label={t('modalLabels.emergencyContact')} value={employee.emergencyContact} />
                        <DetailItem label={t('modalLabels.referenceInfo')} value={employee.referenceInfo} />
                    </dl>
                </div>
            </div>
        </>
        )}
      </div>
    </div>
  );
};