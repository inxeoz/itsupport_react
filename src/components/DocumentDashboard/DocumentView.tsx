import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Badge } from '../ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.tsx';
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
    'Published': 'bg-theme-accent/20 text-theme-accent border-theme-accent/20',
    'Draft': 'bg-secondary text-secondary-foreground border-border',
    'Review': 'bg-muted text-muted-foreground border-border',
    'Archived': 'bg-muted/50 text-muted-foreground border-border'
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
    <div className="p-6 bg-background">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2 text-foreground">Document Management</h1>
          <p className="text-muted-foreground">Manage IT documentation, procedures, and knowledge base</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" className="bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            <span>New Document</span>
          </Button>
          <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-foreground">Share</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="documents" className="bg-background">
            <TabsList className="grid w-full grid-cols-3 bg-muted border-border">
              <TabsTrigger value="documents" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">All Documents</TabsTrigger>
              <TabsTrigger value="recent" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Recent</TabsTrigger>
              <TabsTrigger value="starred" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">Starred</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4 bg-background">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents, tags, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={`whitespace-nowrap ${
                        selectedCategory === category.id
                          ? "bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-foreground"
                          : "border-border text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <span className="text-foreground">{category.name} ({category.count})</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocuments.map(document => (
                  <Card key={document.id} className="group hover:shadow-md transition-shadow border-border bg-card">
                    <CardHeader className="pb-3 bg-card">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-lg">{typeIcons[document.type as keyof typeof typeIcons]}</span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate text-card-foreground">{document.title}</h3>
                            <p className="text-xs text-muted-foreground">{document.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {document.starred && (
                            <Star className="h-4 w-4 text-theme-accent fill-current" />
                          )}
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-accent">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 bg-card">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {document.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{document.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{document.lastModified}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs border ${statusColors[document.status as keyof typeof statusColors]}`}>
                          <span>{document.status}</span>
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs border-border text-foreground">
                            <span>{tag}</span>
                          </Badge>
                        ))}
                        {document.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-border text-foreground">
                            <span>+{document.tags.length - 3}</span>
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4 bg-background">
              <div className="space-y-3">
                {recentDocuments.map(document => (
                  <Card key={document.id} className="border-border bg-card">
                    <CardContent className="p-4 bg-card">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{typeIcons[document.type as keyof typeof typeIcons]}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-card-foreground">{document.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{document.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{document.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{document.lastModified}</span>
                            </div>
                            <span className="text-muted-foreground">{document.size}</span>
                          </div>
                        </div>
                        <Badge className={`text-xs border ${statusColors[document.status as keyof typeof statusColors]}`}>
                          <span>{document.status}</span>
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="starred" className="space-y-4 bg-background">
              <div className="space-y-3">
                {starredDocuments.map(document => (
                  <Card key={document.id} className="border-border bg-card">
                    <CardContent className="p-4 bg-card">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{typeIcons[document.type as keyof typeof typeIcons]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate text-card-foreground">{document.title}</h3>
                            <Star className="h-4 w-4 text-theme-accent fill-current" />
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{document.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{document.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{document.lastModified}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`text-xs border ${statusColors[document.status as keyof typeof statusColors]}`}>
                          <span>{document.status}</span>
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
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <BookOpen className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 bg-card">
              <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">Create Procedure</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">Create Policy</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">Create Guide</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start border-border text-foreground hover:bg-accent hover:text-accent-foreground">
                <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-foreground">Manage Categories</span>
              </Button>
            </CardContent>
          </Card>

          {/* Storage Usage */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Folder className="h-5 w-5 text-theme-accent" />
                <span className="text-card-foreground">Storage Usage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Used</span>
                  <span className="font-medium text-foreground">847 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="font-medium text-foreground">4.2 GB</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-theme-accent h-2 rounded-full" style={{ width: '17%' }}></div>
                </div>
                <div className="text-xs text-muted-foreground">17% of 5 GB used</div>
              </div>
            </CardContent>
          </Card>

          {/* Document Stats */}
          <Card className="border-border bg-card">
            <CardHeader className="bg-card border-b border-border">
              <CardTitle className="text-card-foreground">Document Stats</CardTitle>
            </CardHeader>
            <CardContent className="bg-card">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Documents</span>
                  <span className="font-medium text-foreground">{documents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Published</span>
                  <span className="font-medium text-theme-accent">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">In Review</span>
                  <span className="font-medium text-muted-foreground">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Drafts</span>
                  <span className="font-medium text-secondary-foreground">1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
