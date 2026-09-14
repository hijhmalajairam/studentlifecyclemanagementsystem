import os
import io

def generate_tree(dir_path, prefix='', exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = set(['node_modules', 'venv', '.git', '.next', '__pycache__', '.pytest_cache', 'migrations', 'media'])
    
    output = ""
    try:
        items = sorted(os.listdir(dir_path))
    except PermissionError:
        return ""
        
    items = [i for i in items if i not in exclude_dirs]
    for i, item in enumerate(items):
        is_last = (i == len(items) - 1)
        item_path = os.path.join(dir_path, item)
        
        if is_last:
            output += f"{prefix}└── {item}\n"
            new_prefix = prefix + "    "
        else:
            output += f"{prefix}├── {item}\n"
            new_prefix = prefix + "│   "
            
        if os.path.isdir(item_path):
            output += generate_tree(item_path, new_prefix, exclude_dirs)
            
    return output

with io.open('tree_output.md', 'w', encoding='utf-8') as f:
    f.write("## 4. Backend Directory Structure\n`	ext\nbackend/\n")
    f.write(generate_tree("c:/Users/Asus/OneDrive/Documents/STUDENTLIFECYCLEMANAGEMNT/backend"))
    f.write("`\n\n")
    f.write("## 5. Frontend Directory Structure\n`	ext\nfrontend/\n")
    f.write(generate_tree("c:/Users/Asus/OneDrive/Documents/STUDENTLIFECYCLEMANAGEMNT/frontend"))
    f.write("`\n")

print("Tree generated")
