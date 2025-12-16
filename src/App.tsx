import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog"; // 👈 注意：这里用 open + 新增 directory 方法
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import "./App.css";

function App() {
  const [filePath, setFilePath] = useState<string | null>(null);
  const [exportDir, setExportDir] = useState<string | null>(null); // 新增：导出目录
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getFileName = (path: string) => {
    return path.split(/[/\\]/).pop() || path;
  };

  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "MP3 Files", extensions: ["mp3"] }],
      });
      if (selected && typeof selected === "string") {
        setFilePath(selected);
        setError(null);
      }
    } catch (err) {
      console.error("选择文件失败", err);
      setError("无法打开文件选择器");
    }
  };

  const handleSelectExportDir = async () => {
    try {
      const dir = await open({
        directory: true,
        multiple: false,
        title: "选择导出目录",
      });

      if (dir && typeof dir === "string") {
        setExportDir(dir);
        setError(null);
        console.log("导出目录:", dir);
      }
    } catch (err) {
      console.error("选择目录失败", err);
      setError("无法选择导出目录");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);

    if (!filePath) {
      setError("请先选择一个 MP3 文件");
      return;
    }
    setLoading(true);
    try {
      const result = await invoke("update_id3_tag", {
        filePath,
        exportDir,
        artist: artist.trim(),
        title: title.trim(),
        album: album.trim(),
      });
      console.log("Success:", result);
      setSubmitted(true);
    } catch (err: any) {
      console.error("调用失败", err);
      setError(err?.message || err?.toString() || "操作失败");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilePath(null);
    setExportDir(null);
    setArtist("");
    setTitle("");
    setAlbum("");
    setSubmitted(false);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-5 sm:p-6">
        <header className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">ID3 标签修改器</h1>
          <p className="text-sm text-gray-500 mt-1">
            修改 MP3 元数据，可选择另存到指定目录
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 源文件 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <Label className="text-sm font-medium">源文件</Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleSelectFile}
              className="w-full sm:w-auto"
            >
              选择文件
            </Button>
            {filePath && (
              <span className="text-xs text-gray-600 truncate sm:col-span-1">
                {getFileName(filePath)}
              </span>
            )}
          </div>

          {/* 导出目录（新增） */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <Label className="text-sm font-medium">导出目录</Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleSelectExportDir}
              className="w-full sm:w-auto"
            >
              选择目录
            </Button>
            {exportDir && (
              <span className="text-xs text-gray-600 truncate sm:col-span-1">
                {exportDir}
              </span>
            )}
          </div>

          {/* 元数据 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <Label htmlFor="artist" className="text-sm font-medium">
              歌手
            </Label>
            <Input
              id="artist"
              placeholder="例如：周杰伦"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="sm:col-span-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <Label htmlFor="title" className="text-sm font-medium">
              歌名
            </Label>
            <Input
              id="title"
              placeholder="例如：反方向的钟"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="sm:col-span-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <Label htmlFor="album" className="text-sm font-medium">
              专辑
            </Label>
            <Input
              id="album"
              placeholder="例如：Jay"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="sm:col-span-2"
            />
          </div>

          {/* 操作区 */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
            <div className="text-sm text-gray-500 min-h-[20px]">
              {error && <span className="text-red-600">{error}</span>}
              {submitted && !error && (
                <span className="text-green-600">
                  ✅ {exportDir ? "文件已导出" : "原文件已更新"}！
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                disabled={loading}
              >
                重置
              </Button>
              <Button type="submit" disabled={!filePath || loading}>
                {loading ? "处理中..." : "确定"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default App;