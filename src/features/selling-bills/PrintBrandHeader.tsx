import { SOFT_COMFORT_COMPANY } from '@/config/company';

export function PrintBrandHeader() {
  return (
    <header className="print-brand-header">
      <div className="print-brand-logo-wrap flex justify-center">
        <img
          src="/softcomfort-logo.png"
          alt="Soft Comfort Arredamenti"
          className="print-brand-logo h-[34mm] w-full max-w-[158mm] object-contain"
        />
      </div>

      <div className="print-brand-rule mt-2.5 h-[3px] w-full bg-[#9f1018]" />

      <div className="print-brand-company mt-2 border-2 border-[#303030] bg-white px-3 py-2.5 text-center text-[9px] font-semibold leading-[1.55] text-[#171717]">
        <p>
          {SOFT_COMFORT_COMPANY.locations[0]} · Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
        </p>
        <p>
          {SOFT_COMFORT_COMPANY.locations[1]} · Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
        </p>
        <p className="mt-0.5 font-black tracking-[0.03em]">{SOFT_COMFORT_COMPANY.legalName}</p>
      </div>
    </header>
  );
}
