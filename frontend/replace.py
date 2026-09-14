import sys

file_path = 'c:/Users/Asus/OneDrive/Documents/STUDENTLIFECYCLEMANAGEMNT/frontend/src/app/dashboard/admin/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if '{/* ─── ADMISSIONS TAB ─── */}' in line:
        start_idx = i
    elif '{/* ─── ATTENDANCE TAB ─── */}' in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx]
    new_lines.append('          {/* ─── ADMISSIONS TAB ─── */}\n')
    new_lines.append('          {activeTab === \'admissions\' && (\n')
    new_lines.append('            <AdmissionsTab \n')
    new_lines.append('              applications={applications}\n')
    new_lines.append('              departments={departments}\n')
    new_lines.append('              programs={programs}\n')
    new_lines.append('              offlineForm={offlineForm}\n')
    new_lines.append('              setOfflineForm={setOfflineForm}\n')
    new_lines.append('              createOfflineApplication={createOfflineApplication}\n')
    new_lines.append('              expandedRow={expandedRow}\n')
    new_lines.append('              setExpandedRow={setExpandedRow}\n')
    new_lines.append('              updateStatus={updateStatus}\n')
    new_lines.append('              allocationForms={allocationForms}\n')
    new_lines.append('              setAllocationForms={setAllocationForms}\n')
    new_lines.append('              allocateSeat={allocateSeat}\n')
    new_lines.append('              feeVerifications={feeVerifications}\n')
    new_lines.append('              setFeeVerifications={setFeeVerifications}\n')
    new_lines.append('              verifyFeePayment={verifyFeePayment}\n')
    new_lines.append('              showOfflineForm={showOfflineForm}\n')
    new_lines.append('            />\n')
    new_lines.append('          )}\n\n')
    new_lines.extend(lines[end_idx:])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print('Replaced successfully!')
else:
    print('Indices not found:', start_idx, end_idx)
