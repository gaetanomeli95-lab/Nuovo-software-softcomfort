import { SOFT_COMFORT_COMPANY } from '@/config/company';

export function PrintBrandHeader() {
  return (
    <header className="print-brand-header">
      <div className="flex justify-center">
        <img
          src="/softcomfort-logo.png"
          alt="Soft Comfort Arredamenti"
          className="h-[24mm] w-full max-w-[112mm] object-contain"
        />
      </div>

      <div className="mt-3 h-[3px] w-full bg-[#9f1018]" />

      <div className="mt-2 border-2 border-[#414141] bg-white px-3 py-2 text-center text-[8.5px] font-semibold leading-[1.6] text-[#202020]">
        <p>
          {SOFT_COMFORT_COMPANY.locations[0]} · Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
        </p>
        <p>
          {SOFT_COMFORT_COMPANY.locations[1]} · Tel. {SOFT_COMFORT_COMPANY.phone} · {SOFT_COMFORT_COMPANY.website}
        </p>
        <p className="mt-0.5 font-extrabold">{SOFT_COMFORT_COMPANY.legalName}</p>
      </div>
    </header>
  );
}
