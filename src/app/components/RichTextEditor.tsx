import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = '', 
  minHeight = '300px' 
}: RichTextEditorProps) {
  const [ReactQuill, setReactQuill] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import('react-quill').then((mod) => {
      setReactQuill(() => mod.default);
      setIsLoading(false);
    });
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  if (isLoading || !ReactQuill) {
    return (
      <div className="border border-slate-300 dark:border-slate-600 rounded-xl p-8 flex items-center justify-center" style={{ minHeight }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">Editör yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      placeholder={placeholder}
      className="bg-white dark:bg-slate-700"
      style={{ minHeight }}
    />
  );
}
