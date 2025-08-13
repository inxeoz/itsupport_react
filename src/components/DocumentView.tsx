import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Search, 
  Plus, 
  Folder, 
  Star, 
  Clock, 
  User, 
  Download, 
  Share2,
  MoreHorizontal,
  BookOpen,
  Settings,
  Lock
} from 'lucide-react';

export function DocumentView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample documents data
  const documents = [
    {
      id: 1,
      title: 'Server Maintenance Procedures',
      category: 'Procedures',
      type: 'PDF',
      size: '2.4 MB',
      author: 'John Doe',
      lastModified: '2024-08-12',
      tags: ['server', 'maintenance', 'procedures'],
      status: 'Published',
      starred: true,
      description: 'Comprehensive guide for server maintenance and troubleshooting procedures.'
    },
    {
      id: 2,
      title: 'Network Security Policy',
      category: 'Policies',
      type: 'DOCX',
      size: '1.8 MB',
      author: 'Jane Smith',
      lastModified: '2024-08-10',
      tags: ['security', 'network', 'policy'],
      status: 'Draft',
      starred: false,
      description: 'Updated network security policies and compliance requirements.'
    },
    {
      id: 3,
      title: 'Software Installation Guide',
      category: 'Guides',
      type: 'PDF',
      size: '3.1 MB',
      author: 'Mike Johnson',
      lastModified: '2024-08-09',
      tags: ['software', 'installation', 'guide'],
      status: 'Published',
      starred: true,
      description: 'Step-by-step guide for standard software installations.'
    },
    {
      id: 4,
      title: 'Incident Response Playbook',
      category: 'Procedures',
      type: 'PDF',
      size: '4.2 MB',
      author: 'Sarah Wilson',
      lastModified: '2024-08-08',
      tags: ['incident', 'response', 'security'],
      status: 'Published',
      starred: false,
      description: 'Emergency response procedures for security incidents.'
    },
    {
      id: 5,
      title: 'Hardware Specifications',
      category: 'References',
      type: 'XLSX',
      size: '856 KB',
      author: 'John Doe',
      lastModified: '2024-08-07',
      tags: ['hardware', 'specifications', 'inventory'],
      status: 'Published',
      starred: false,
      description: 'Current hardware inventory and specifications database.'
    },
    {
      id: 6,
      title: 'User Training Materials',
      category: 'Training',
      type: 'PPTX',
      size: '15.3 MB',
      author: 'Jane Smith',
      lastModified: '2024-08-06',
      tags: ['training', 'users', 'education'],
      status: 'Review',
      starred: true,
      description: 'Training presentation materials for end users.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Documents', count: documents.length },
    { id: 'procedures', name: 'Procedures', count: 2 },
    { id: 'policies', name: 'Policies', count: 1 },
    { id: 'guides', name: 'Guides', count: 1 },
    { id: 'references', name: 'References', count: 1 },
    { id: 'training', name: 'Training', count: 1 }
  ];

  const recentDocuments = documents.slice(0, 3);
  const starredDocuments = documents.filter(doc => doc.starred);

  const statusColors = {
    'Published': 'bg-green-600',
    'Draft': 'bg-yellow-600',
    'Review': 'bg-blue-600',
    'Archived': 'bg-gray-600'
  };

  const typeIcons = {
    'PDF': '📄',
    'DOCX': '📝',
    'XLSX': '📊',
    'PPTX': '📊'
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
                           doc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Document Management</h1>
          <p className="text-muted-foreground">Manage IT documentation, procedures, and knowledge base</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Document
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="documents">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="documents">All Documents</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="starred">Starred</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents, tags, or content..."
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
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocuments.map(document => (
                  <Card key={document.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-lg">{typeIcons[document.type as keyof typeof typeIcons]}</span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate">{document.title}</h3>
                            <p className="text-xs text-muted-foreground">{document.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {document.starred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {document.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {document.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {document.lastModified}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={`text-white text-xs ${statusColors[document.status as keyof typeof statusColors]}`}>
                          {document.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {document.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{document.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <div className="space-y-3">
                {recentDocuments.map(document => (
                  <Card key={document.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{typeIcons[document.type as keyof typeof typeIcons]}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{document.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{document.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {document.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {document.lastModified}
                            </div>
                            <span>{document.size}</span>
                          </div>
                        </div>
                        <Badge className={`text-white text-xs ${statusColors[document.status as keyof typeof statusColors]}`}>
                          {document.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="starred" className="space-y-4">
              <div className="space-y-3">
                {starredDocuments.map(document => (
                  <Card key={document.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{typeIcons[document.type as keyof typeof typeIcons]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{document.title}</h3>
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{document.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {document.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {document.lastModified}
                            </div>
                          </div>
                        </div>
                        <Badge className={`text-white text-xs ${statusColors[document.status as keyof typeof statusColors]}`}>
                          {document.status}
                        </Badge>
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
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Create Procedure
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Lock className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Create Guide
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Used</span>
                  <span className="font-medium">847 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="font-medium">4.2 GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '17%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">17% of 5 GB used</div>
              </div>
            </CardContent>
          </Card>

          {/* Document Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Document Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Documents</span>
                  <span className="font-medium">{documents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <span className="font-medium text-green-600">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">In Review</span>
                  <span className="font-medium text-blue-600">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Drafts</span>
                  <span className="font-medium text-yellow-600">1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}