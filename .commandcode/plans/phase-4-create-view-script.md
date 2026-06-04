# Phase 4 — Create & View Script

## Mục tiêu
Form tạo project + Script viewer/editor (timeline, slide list, inline edit, export).

## Trạng thái
- 🔜 Chưa bắt đầu

## Files cần tạo

### 5.1 `src/app/(dashboard)/projects/new/page.tsx`
Create project page:
- Divider hoặc steps indicator
- ProjectCreateForm
- Sau khi create → redirect đến project page và trigger generate

### 5.2 `src/components/projects/project-create-form.tsx`
Form dùng react-hook-form + zod resolver:
- Title (input)
- Prompt/Requirements (textarea lớn, placeholder gợi ý)
- Target Duration (select: 1 phút, 3 phút, 5 phút, 10 phút, custom)
- Style (select: Professional, Casual, Educational, Marketing)
- Platform (select: YouTube, TikTok, Facebook, Generic)
- Visual Style (select: Cinematic, Realistic, Flat Illustration, Minimalist, Infographic)
- Language (select: Tiếng Việt, English)
- Submit button "Create & Generate"

### 5.3 `src/hooks/use-projects.ts`
React Query hooks:
```typescript
export function useProjects(params) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => fetchProjects(params),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
  });
}

export function useCreateProject() {
  return useMutation({
    mutationFn: (data: CreateProjectInput) => createProject(data),
  });
}

export function useUpdateProject() {
  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
  });
}

export function useDeleteProject() {
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
  });
}
```

### 5.4 `src/hooks/use-script-generation.ts`
Hook xử lý SSE stream:
```typescript
export function useScriptGeneration(projectId: string) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setStatus("researching");
    // Connect SSE
    // Listen events: researching, generating, validating, completed, error
  }

  return { status, progress, error, generate };
}
```

### 5.5 `src/app/(dashboard)/projects/[projectId]/page.tsx`
Script viewer page:
- ProjectHeader (title, status badge, action buttons)
- Tabs: Timeline | Slides | JSON | Versions

### 5.6 `src/components/script/script-generate-panel.tsx`
Generate controls:
- Khi DRAFT: button "Generate Script" + style preview
- Khi GENERATING: progress bar + status message + cancel
- Khi COMPLETED: button "Regenerate", thông tin AI usage
- Khi FAILED: error message + button "Retry"

### 5.7 `src/components/script/slide-card.tsx`
Hiển thị 1 slide dạng card:
- Slide number + type badge
- Title (bold)
- Content preview
- Visual description
- Subtitle
- Duration + transition info
- Edit button (mở dialog hoặc inline)

### 5.8 `src/components/script/script-timeline.tsx`
Timeline view:
- Danh sách SlideCard
- Vertical timeline line kết nối các slide
- Thể hiện duration mỗi slide

### 5.9 `src/components/script/slide-editor.tsx`
Inline/dialog edit slide:
- Edit: title, content, subtitle, visualDescription
- Edit: duration (number input), transition (select)
- Edit: notes
- Save → PATCH project với scriptData mới

### 5.10 `src/components/script/slide-list.tsx`
List view với SlideEditor inline:
- Collapsible accordion per slide
- Drag-to-reorder (P2 - optional)

### 5.11 `src/components/script/script-export.tsx`
Export button:
- Download JSON file
- Copy to clipboard
- Preview JSON formatted

### 5.12 `src/hooks/use-script.ts`
```typescript
export function useUpdateScript(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scriptData: Script) =>
      updateProject(projectId, { scriptData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}
```

## Verification
- Tạo project từ form → redirect project page → trigger generate
- Generate progress hiển thị real-time
- Script hoàn thành → hiển thị timeline
- Edit slide → save → reload giữ nguyên
- Export JSON → download file
