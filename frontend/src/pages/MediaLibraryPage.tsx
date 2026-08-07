import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, Folder, Upload, MoreVertical, Search, Download, Trash2, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { mediaService } from '../services/mediaService';
import type { MediaItem } from '../services/mediaService';

export const MediaLibraryPage: React.FC = () => {
  const [activeFolder, setActiveFolder] = useState('All Media');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = () => {
    mediaService.getMedia()
      .then(data => {
        setMedia(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // For prototype: Convert file to Base64 to save as URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Use a mock user ID for the prototype
        const mockUserId = 'cm0p4q6z0000008lc6a8f1n2d'; 

        await mediaService.uploadMedia({
          userId: mockUserId,
          url: base64String, // Store base64 string as the URL
          filename: file.name,
          sizeBytes: file.size,
          mimeType: file.type,
          source: 'upload'
        });

        // Refresh the list after upload
        fetchMedia();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const folders = ['All Media', 'Inspection Reports', 'Tomatoes', 'Warehouse', 'Favorites'];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="h-8 w-8 text-primary" />
            Media Library
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All your uploaded and analyzed images securely stored in one place.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search media..." className="pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64" />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
          <Button variant="default" className="flex items-center gap-2" onClick={handleUploadClick} disabled={uploading}>
            <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Folders</h3>
            </div>
            <ul className="space-y-1">
              {folders.map(folder => (
                <li 
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm ${
                    activeFolder === folder 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className={`h-4 w-4 ${activeFolder === folder ? 'text-primary' : ''}`} /> 
                    {folder}
                  </div>
                  {folder === 'All Media' && <span className="text-xs bg-muted px-1.5 rounded-full">{media.length}</span>}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Gallery Grid */}
        <div className="lg:col-span-4">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading media...</div>
          ) : media.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border border-border border-dashed">
              No media found. Upload your first image!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {media.map(item => (
                <div key={item.id} className="group relative aspect-square bg-muted rounded-xl overflow-hidden border border-border">
                  <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.filename} />
                  
                  {/* Top overlay */}
                  <div className="absolute inset-x-0 top-0 p-3 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-start">
                      {item.source === 'inspection' ? (
                        <Badge variant="default" className="bg-primary/90 text-primary-foreground backdrop-blur-md border-none">Analysis</Badge>
                      ) : (
                        <Badge variant="success" className="bg-green-500/90 text-white backdrop-blur-md border-none">Upload</Badge>
                      )}
                      <button className="text-white/80 hover:text-white"><MoreVertical className="h-5 w-5" /></button>
                    </div>
                  </div>
                  
                  {/* Bottom overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-medium text-sm line-clamp-1">{item.filename}</p>
                    <div className="flex items-center gap-2 text-white/70 text-xs mt-1">
                      <Calendar className="h-3 w-3" /> {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs border-white/20 text-white hover:bg-white/20 hover:text-white bg-black/40"><Download className="h-3 w-3 mr-1" /> Save</Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs border-red-500/30 text-red-300 hover:bg-red-500/20 bg-black/40"><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
