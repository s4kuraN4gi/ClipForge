-- 010: テンプレートを3種→12種に拡張
ALTER TABLE projects DROP CONSTRAINT projects_template_check;
ALTER TABLE projects ADD CONSTRAINT projects_template_check
  CHECK (template IN (
    'showcase', 'before_after', 'rotation',
    'close_up', 'minimal', 'dramatic', 'sparkle',
    'zoom_in', 'lifestyle', 'gift', 'seasonal', 'floating'
  ));
