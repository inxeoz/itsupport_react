import { Settings, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function Header() {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-medium text-white">MYTICK</h1>
        <Badge variant="secondary" className="bg-emerald-600 text-white border-none">
          In Portal
        </Badge>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
        
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </header>
  );
}