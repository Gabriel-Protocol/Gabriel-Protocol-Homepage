import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

export function SettingsTab({
  figmaShareUrl,
  figmaEmbedUrl,
  setFigmaShareUrl,
  setFigmaEmbedUrl,
}: {
  figmaShareUrl: string;
  figmaEmbedUrl: string;
  setFigmaShareUrl: (v: string) => void;
  setFigmaEmbedUrl: (v: string) => void;
}) {
  const [share, setShare] = useState(figmaShareUrl);
  const [embed, setEmbed] = useState(figmaEmbedUrl);

  useEffect(() => setShare(figmaShareUrl), [figmaShareUrl]);
  useEffect(() => setEmbed(figmaEmbedUrl), [figmaEmbedUrl]);

  const handleSave = () => {
    setFigmaShareUrl(share.trim());
    setFigmaEmbedUrl(embed.trim());
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50 mb-1">Pengaturan</h2>
      <p className="text-slate-500 mb-6">Konfigurasi link Mindmap Figma yang ditampilkan di halaman utama dan goals.</p>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base">Figma Mindmap</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Figma Share URL</label>
              <input
                value={share}
                onChange={(e) => setShare(e.target.value)}
                placeholder="https://www.figma.com/board/..."
                className="mt-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <p className="text-xs text-slate-400 mt-1">Digunakan untuk tampilan preview Figma.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Figma Embed URL</label>
              <input
                value={embed}
                onChange={(e) => setEmbed(e.target.value)}
                placeholder="https://embed.figma.com/board/..."
                className="mt-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <p className="text-xs text-slate-400 mt-1">Digunakan untuk embed langsung pada layout.</p>
            </div>

            <div className="flex items-center justify-end">
              <Button onClick={handleSave}>Simpan</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsTab;
