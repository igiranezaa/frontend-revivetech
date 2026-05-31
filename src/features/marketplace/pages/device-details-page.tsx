import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Truck,
  RefreshCw,
  CreditCard,
  ShoppingCart,
  BadgeCheck,
  BatteryCharging,
  Leaf,
  Sparkles,
  Wrench,
  CircleCheck,
} from 'lucide-react';
import { useCart } from '../../../context/useCart';
import { Link } from "react-router-dom";
import LoadingSpinner from '../../../shared/components/loading-spinner';
import type { Listing } from '../types';
import { getApiErrorMessage, getMarketplaceListing } from '../../../lib/api';


export default function DeviceDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [financingMonths, setFinancingMonths] = useState(12);
  const [device, setDevice] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let alive = true;
    getMarketplaceListing(id)
      .then((item) => {
        if (alive) setDevice(item);
      })
      .catch((err) => {
        if (alive) setError(getApiErrorMessage(err, 'Device not found.'));
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (isLoading) return <LoadingSpinner message='Loading device from database...' />;

  if (!device) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center'>
        <div>
          <p className='text-gray-700 font-bold mb-4'>{error || 'Device not found.'}</p>
          <Link to='/marketplace' className='text-[#127058] font-semibold hover:underline'>Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const monthlyInstallment = (device.current_price / financingMonths).toFixed(
    0,
  );
  const totalSavings = device.original_price - device.current_price;
  const trustScore = device.trustScore ?? 100;
  const certificationDate = device.certifiedAt
    ? new Date(device.certifiedAt).toLocaleDateString()
    : 'Verified before listing';

  return (
    <>
    <div className='min-h-screen bg-gray-50/50 pb-12'>
      <div className='max-w-7xl mx-auto p-4 sm:p-6 lg:p-8'>
        {/* Back Link */}
        <Link
          to={`/marketplace`}
          className='inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#127058] transition-colors mb-6 group'
        >
          <ArrowLeft
            size={16}
            className='transition-transform group-hover:-translate-x-1'
          />
          <span>Back to Marketplace</span>
        </Link>

        {/* Main Grid Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start'>
          {/* Left Column: Product Image Gallery Layout */}
          <div className='bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center justify-center overflow-hidden min-h-[350px] sm:min-h-[450px] relative'>
            <img
              src={device.img}
              alt={device.title}
              className='object-contain max-h-[400px] w-full hover:scale-102 transition-transform duration-300'
            />
            {/* Category Badge */}
            <span className='absolute top-6 left-6 bg-[#ef9f27] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm capitalize tracking-wide'>
              {device.category}
            </span>
          </div>

          {/* Right Column: Device Purchasing Details Info */}
          <div className='flex flex-col'>
            {/* Title & Taglines */}
            <h1 className='text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight'>
              {device.title}
            </h1>

            {/* Price Presentation Block */}
            <div className='mt-4 flex items-baseline gap-3 flex-wrap'>
              <span className='text-3xl font-black text-gray-950'>
                ${device.current_price}
              </span>
              <span className='text-lg text-gray-400 line-through font-medium'>
                ${device.original_price}
              </span>
              <span className='text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg'>
                Save ${totalSavings}
              </span>
            </div>

            <p className='text-gray-600 mt-6 leading-relaxed font-medium text-sm sm:text-base'>
              {device.description}
            </p>

            {/* Technical Quick Specs Table Section */}
            <div className='mt-6 border border-gray-100 bg-white rounded-2xl p-4 shadow-inner-sm'>
              <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-3'>
                Device Specifications
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                {device.specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className='border-b border-gray-50 pb-2 last:border-0'
                  >
                    <p className='text-xs text-gray-400 font-medium'>
                      {spec.label}
                    </p>
                    <p className='text-sm text-gray-900 font-bold mt-0.5'>
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital passport */}
            <div className='mt-6 rounded-2xl overflow-hidden border border-[#127058]/20 bg-[#f4fbf8]'>
              <div className='px-5 py-4 bg-[#127058] text-white flex items-start justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <BadgeCheck size={21} />
                  <div>
                    <h3 className='text-sm font-black'>Device Digital Passport</h3>
                    <p className='text-[11px] text-white/70 mt-0.5'>Certified refurbishment record</p>
                  </div>
                </div>
                <span className='bg-white/15 px-2.5 py-1 rounded-full text-[11px] font-black'>{trustScore}/100 TRUST</span>
              </div>
              <div className='grid grid-cols-2 gap-px bg-[#127058]/10'>
                {[
                  { label: 'Certification', value: device.certificationDetails ?? 'Certified refurbished', icon: CircleCheck },
                  { label: 'Battery health', value: `${device.batteryHealth ?? 100}% tested`, icon: BatteryCharging },
                  { label: 'Repair history', value: 'Diagnostics and QC passed', icon: Wrench },
                  { label: 'Certified', value: certificationDate, icon: Shield },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className='bg-[#f4fbf8] px-4 py-3'>
                    <Icon className='w-4 h-4 text-[#127058] mb-1.5' />
                    <p className='text-[10px] font-black uppercase tracking-wider text-gray-400'>{label}</p>
                    <p className='text-xs font-bold text-gray-800 mt-0.5'>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI financing assistant */}
            <div className='mt-6 bg-[#fff8eb] border border-[#EF9F27]/35 rounded-2xl p-5'>
              <div className='flex items-start gap-3'>
                <div className='w-9 h-9 rounded-xl bg-[#EF9F27] flex items-center justify-center text-gray-950 flex-shrink-0'>
                  <Sparkles className='w-4 h-4' />
                </div>
                <div>
                  <h3 className='text-sm font-black text-gray-900'>AI financing guidance</h3>
                  <p className='text-xs text-gray-600 leading-relaxed mt-1'>
                    Based on this device price, the {financingMonths}-month plan keeps your estimated payment at
                    <strong className='text-gray-900'> ${monthlyInstallment}/month</strong>. Final approval remains with a finance officer.
                  </p>
                </div>
              </div>
            </div>

            {/* Flexible Financing Plan Selector UI Toggle */}
            <div className='mt-6 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm'>
              <div className='flex items-center gap-2 text-[#127058] mb-3'>
                <CreditCard size={18} />
                <h3 className='font-bold text-sm text-gray-950'>
                  Flexible Financing Plan
                </h3>
              </div>
              <p className='text-xs text-gray-500 font-medium mb-4'>
                Choose a plan duration that fits your monthly checkout budget
                comfortably.
              </p>

              {/* Radio Action Choice Buttons */}
              <div className='grid grid-cols-3 gap-3'>
                {[3, 6, 12].map((months) => (
                  <button
                    key={months}
                    type='button'
                    onClick={() => setFinancingMonths(months)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      financingMonths === months
                        ? 'border-[#127058] bg-[#127058]/5 text-[#127058] ring-2 ring-[#127058]/20'
                        : 'border-gray-200 bg-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {months} Months
                  </button>
                ))}
              </div>

              {/* Installment Pricing Summary banner text block */}
              <div className='mt-4 pt-4 border-t border-gray-50 flex items-center justify-between'>
                <span className='text-xs font-semibold text-gray-500'>
                  Estimated payment:
                </span>
                <span className='text-base font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg'>
                  From ${monthlyInstallment}/mo
                </span>
              </div>
            </div>

            {/* Call To Action Buttons (Add To Cart) */}
            <div className='mt-8'>
              <button
                onClick={() => addToCart(device)} // Pass the whole loaded item object structure here
                className='w-full bg-[#127058] hover:bg-[#0e5845] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2.5 group text-base'
              >
                <ShoppingCart
                  size={20}
                  className='transition-transform group-hover:scale-110'
                />
                <span>Add Device to Cart</span>
              </button>
            </div>

            {/* Consumer Trust Guarantees Grid Row */}
            <div className='mt-6 grid grid-cols-3 gap-2 text-center'>
              <div className='flex flex-col items-center p-3 bg-gray-50 rounded-xl'>
                <Shield size={18} className='text-[#127058] mb-1' />
                <span className='text-[10px] font-bold text-gray-700 leading-snug'>
                  12-Mo Warranty
                </span>
              </div>
              <div className='flex flex-col items-center p-3 bg-gray-50 rounded-xl'>
                <Truck size={18} className='text-[#127058] mb-1' />
                <span className='text-[10px] font-bold text-gray-700 leading-snug'>
                  Free Shipping
                </span>
              </div>
              <div className='flex flex-col items-center p-3 bg-gray-50 rounded-xl'>
                <RefreshCw size={18} className='text-[#127058] mb-1' />
                <span className='text-[10px] font-bold text-gray-700 leading-snug'>
                  30-Day Returns
                </span>
              </div>
            </div>

            <div className='mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-emerald-800'>
              <span className='inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-100'>
                <Leaf className='w-3.5 h-3.5' /> {device.eWasteSavedKg ?? 0} kg e-waste avoided
              </span>
              <span className='inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-100'>
                <Leaf className='w-3.5 h-3.5' /> {device.carbonSavedKg ?? 0} kg carbon impact reduced
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
