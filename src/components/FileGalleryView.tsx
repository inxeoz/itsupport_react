import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Upload, 
  Search, 
  Image, 
  File, 
  Video, 
  Archive,
  Download, 
  Share2,
  MoreHorizontal,
  Grid3X3,
  List,
  Filter,
  FolderOpen,
  Trash2,
  Eye
} from 'lucide-react';

export function FileGalleryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample files data
  const files = [
    {
      id: 1,
      name: 'server-diagram.png',
      type: 'image',
      size: '2.4 MB',
      uploadedBy: 'John Doe',
      uploadDate: '2024-08-12',
      category: 'Images',
      ticketId: 'TK-2089',
      tags: ['server', 'diagram', 'infrastructure'],
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      description: 'Network infrastructure diagram'
    },
    {
      id: 2,
      name: 'security-report.pdf',
      type: 'document',
      size: '1.8 MB',
      uploadedBy: 'Jane Smith',
      uploadDate: '2024-08-11',
      category: 'Documents',
      ticketId: 'TK-2087',
      tags: ['security', 'report', 'audit'],
      url: '/placeholder-pdf.png',
      description: 'Monthly security audit report'
    },
    {
      id: 3,
      name: 'training-video.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadedBy: 'Mike Johnson',
      uploadDate: '2024-08-10',
      category: 'Videos',
      ticketId: 'TK-2086',
      tags: ['training', 'video', 'tutorial'],
      url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
      description: 'Software installation tutorial'
    },
    {
      id: 4,
      name: 'backup-logs.zip',
      type: 'archive',
      size: '12.7 MB',
      uploadedBy: 'Sarah Wilson',
      uploadDate: '2024-08-09',
      category: 'Archives',
      ticketId: 'TK-2085',
      tags: ['backup', 'logs', 'archive'],
      url: '/placeholder-archive.png',
      description: 'System backup log files'
    },
    {
      id: 5,
      name: 'hardware-specs.xlsx',
      type: 'document',
      size: '856 KB',
      uploadedBy: 'John Doe',
      uploadDate: '2024-08-08',
      category: 'Documents',
      ticketId: 'TK-2084',
      tags: ['hardware', 'specifications', 'inventory'],
      url: '/placeholder-excel.png',
      description: 'Hardware inventory spreadsheet'
    },
    {
      id: 6,
      name: 'network-topology.jpg',
      type: 'image',
      size: '3.2 MB',
      uploadedBy: 'Jane Smith',
      uploadDate: '2024-08-07',
      category: 'Images',
      ticketId: 'TK-2083',
      tags: ['network', 'topology', 'diagram'],
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      description: 'Current network topology diagram'
    },
    {
      id: 7,
      name: 'error-screenshots.zip',
      type: 'archive',
      size: '8.4 MB',
      uploadedBy: 'Mike Johnson',
      uploadDate: '2024-08-06',
      category: 'Archives',
      ticketId: 'TK-2082',
      tags: ['error', 'screenshots', 'debugging'],
      url: '/placeholder-archive.png',
      description: 'Error screenshots for troubleshooting'
    },
    {
      id: 8,
      name: 'demo-presentation.pptx',
      type: 'document',
      size: '15.3 MB',
      uploadedBy: 'Sarah Wilson',
      uploadDate: '2024-08-05',
      category: 'Documents',
      ticketId: 'TK-2081',
      tags: ['presentation', 'demo', 'training'],
      url: '/placeholder-pptx.png',
      description: 'Product demonstration slides'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Files', count: files.length, icon: File },
    { id: 'images', name: 'Images', count: files.filter(f => f.type === 'image').length, icon: Image },
    { id: 'documents', name: 'Documents', count: files.filter(f => f.type === 'document').length, icon: File },
    { id: 'videos', name: 'Videos', count: files.filter(f => f.type === 'video').length, icon: Video },
    { id: 'archives', name: 'Archives', count: files.filter(f => f.type === 'archive').length, icon: Archive }
  ];

  const recentFiles = files.slice(0, 4);
  const imageFiles = files.filter(f => f.type === 'image');

  const typeIcons = {
    'image': '🖼️',
    'document': '📄',
    'video': '🎥',
    'archive': '📦'
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
                           file.type === selectedCategory.replace('s', '');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">File Gallery</h1>
          <p className="text-muted-foreground">Manage attachments, images, and media files</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="gallery">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid w-fit grid-cols-3">
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="gallery" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files, tags, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      <category.icon className="h-4 w-4 mr-1" />
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Files Display */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFiles.map(file => (
                    <Card key={file.id} className="group hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center relative">
                          {file.type === 'image' ? (
                            <img 
                              src={file.url} 
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl">{typeIcons[file.type as keyof typeof typeIcons]}</span>
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm truncate" title={file.name}>
                            {file.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {file.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{file.size}</span>
                            <span>{file.uploadDate}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {file.ticketId}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFiles.map(file => (
                    <Card key={file.id} className="group hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {file.type === 'image' ? (
                              <img 
                                src={file.url} 
                                alt={file.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-lg">{typeIcons[file.type as keyof typeof typeIcons]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{file.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{file.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span>By {file.uploadedBy}</span>
                              <span>{file.uploadDate}</span>
                              <span>{file.size}</span>
                              <Badge variant="outline" className="text-xs">
                                {file.ticketId}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentFiles.map(file => (
                  <Card key={file.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center relative">
                        {file.type === 'image' ? (
                          <img 
                            src={file.url} 
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl">{typeIcons[file.type as keyof typeof typeIcons]}</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm truncate">{file.name}</h3>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageFiles.map(file => (
                  <Card key={file.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-square rounded-t-lg overflow-hidden bg-muted">
                        <img 
                          src={file.url} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-2">
                        <h3 className="font-medium text-sm truncate">{file.name}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{file.size}</span>
                          <Badge variant="outline" className="text-xs">
                            {file.ticketId}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Quick Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drop files here or click to browse
                </p>
                <Button size="sm" variant="outline">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Storage Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Images</span>
                  <span className="font-medium">145 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Documents</span>
                  <span className="font-medium">423 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Videos</span>
                  <span className="font-medium">1.2 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Archives</span>
                  <span className="font-medium">89 MB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '38%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">1.9 GB of 5 GB used</div>
              </div>
            </CardContent>
          </Card>

          {/* File Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filter
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="h-4 w-4 mr-2" />
                Share Selected
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Bulk Download
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}