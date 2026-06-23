export function rankBadgeClass(rankName: string): string {
  if (rankName.includes('王者')) {
    return 'bg-gradient-to-r from-[#ff5f6d] to-[#ffc371] border-[#f97316] text-black';
  }
  if (rankName.includes('钻石')) {
    return 'bg-gradient-to-r from-[#a7f3ff] to-[#67e8f9] border-[#22d3ee] text-black';
  }
  if (rankName.includes('铂金')) {
    return 'bg-gradient-to-r from-[#f8fafc] to-[#cbd5e1] border-[#94a3b8] text-black';
  }
  if (rankName.includes('黄金')) {
    return 'bg-gradient-to-r from-[#fde047] to-[#f59e0b] border-[#d97706] text-black';
  }
  if (rankName.includes('白银')) {
    return 'bg-gradient-to-r from-[#f8fafc] to-[#c0c0c0] border-[#9ca3af] text-black';
  }
  if (rankName.includes('青铜')) {
    return 'bg-gradient-to-r from-[#fdba74] to-[#b45309] border-[#92400e] text-black';
  }
  return 'bg-gradient-to-r from-slate-200 to-slate-400 border-slate-500 text-black';
}

export function rankProgressFillClass(rankName: string): string {
  if (rankName.includes('王者')) {
    return 'bg-gradient-to-r from-[#ff5f6d] to-[#ffc371]';
  }
  if (rankName.includes('钻石')) {
    return 'bg-gradient-to-r from-[#a7f3ff] to-[#67e8f9]';
  }
  if (rankName.includes('铂金')) {
    return 'bg-gradient-to-r from-[#f8fafc] to-[#cbd5e1]';
  }
  if (rankName.includes('黄金')) {
    return 'bg-gradient-to-r from-[#fde047] to-[#f59e0b]';
  }
  if (rankName.includes('白银')) {
    return 'bg-gradient-to-r from-[#f8fafc] to-[#c0c0c0]';
  }
  if (rankName.includes('青铜')) {
    return 'bg-gradient-to-r from-[#fdba74] to-[#b45309]';
  }
  return 'bg-gradient-to-r from-slate-300 to-slate-500';
}
