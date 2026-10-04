'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; 
import '@/app/styles/Home.css'
import PayButton from '@/components/PayButton';
import { schema } from '@/app/lib/schema';
import { z } from 'zod';
import type { ChangeEvent } from 'react';

const STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT (Abuja)","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara"
];

type NigerianStateSelectProps = {
  value: any;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

type FormData = z.infer<typeof schema>;

const StateSelect = ({ value, onChange }: NigerianStateSelectProps) => (
  <select value={value} onChange={onChange}>
    <option value="">— Select State —</option>
    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
  </select>
);

export default function Home() {
  const [booking, setBooking] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);
  const [validatedData, setValidatedData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      intentionInfo: "",
      intention: "",
      amount: 0,
      origin: "",
      phoneNo: "",
      partnerFirstName: "",
      partnerLastName: "",
      partnerOrigin: ""
    },
  });

  const selectedIntention = watch("intention");
  const phoneNoValue = watch("phoneNo");
  const originValue = watch("origin");
  const partnerOriginValue = watch("partnerOrigin");
  const amountValue = watch("amount");

  useEffect(() => {
    if (typeof selectedIntention === 'string' && ["Child Presentation", "Wedding Mass", "Requiem Mass", "Baptism"].includes(selectedIntention)) {
      setValue("intentionInfo", selectedIntention);
    }
  }, [selectedIntention, setValue]);

  const addDate = (val: string) => {
    if (!booking.includes(val)) {
      const updatedBookings = [...booking, val];
      setBooking(updatedBookings);
      setValue("amount", updatedBookings.length * 100);
    }
  };

  const removeDate = (index: number) => {
    const updatedBookings = booking.filter((_, i) => i !== index);
    setBooking(updatedBookings);
    setValue("amount", updatedBookings.length * 100);
  };

  const handleFormValidationSuccess = (data: FormData) => {
    setValidatedData({ ...data, _triggerType: 'preverify' });
  };

  return (
    <form className="container" onSubmit={(e) => e.preventDefault()}>
      <div className="inner-wrap">

        <h1 className="home-title">Mass Booking</h1>
        <div className="gold-divider" />
        <p className="home-subtitle">St. Ferdinand Parish</p>

        <div className="field-group">
          <label>First Name</label>
          <input type="text" placeholder="Enter your first name" {...register("firstName")} />
          {errors.firstName && <p style={{ color: 'red' }}>{errors.firstName.message}</p>}
        </div>

        <div className="field-group">
          <label>Last Name</label>
          <input type="text" placeholder="Enter your last name" {...register("lastName")} />
          {errors.lastName && <p style={{ color: 'red' }}>{errors.lastName.message}</p>}
        </div>

        <div className="field-group">
          <label>Intention</label>
          <select {...register("intention")}>
            <option value="">— Select an Intention —</option>
            <option value="Thanksgiving">Thanksgiving (Processing to the Altar)</option>
            <option value="Mass Intention">Mass Intention (Not Processing to Altar)</option>
            <option value="Child Presentation">Child Presentation</option>
            <option value="Wedding Mass">Wedding Mass</option>
            <option value="Requiem Mass">Requiem Mass</option>
            <option value="Baptism">Baptism</option>
          </select>
          {errors.intention && <p style={{ color: 'red' }}>{errors.intention.message}</p>}
        </div>

        {selectedIntention === "Thanksgiving" && (
          <div className="field-group">
            <label>Thanking God For</label>
            <input type="text" placeholder="What are you thanking God for?" {...register("intentionInfo")} />
            {errors.intentionInfo && <p style={{ color: 'red' }}>{errors.intentionInfo.message}</p>}
          </div>
        )}

        {selectedIntention === "Mass Intention" && (
          <div className="field-group">
            <label>Dedication</label>
            <input type="text" placeholder="What are you dedicating this Mass for?" {...register("intentionInfo")} />
            {errors.intentionInfo && <p style={{ color: 'red' }}>{errors.intentionInfo.message}</p>}
          </div>
        )}

        {selectedIntention === "Wedding Mass" && (
          <>
            <p className="section-label">Partner Details</p>

            <div className="field-group">
              <label>Partner's First Name</label>
              <input type="text" placeholder="Partner's first name" {...register("partnerFirstName")} />
              {errors.partnerFirstName && <p style={{ color: 'red' }}>{errors.partnerFirstName.message}</p>}
            </div>

            <div className="field-group">
              <label>Partner's Last Name</label>
              <input type="text" placeholder="Partner's last name" {...register("partnerLastName")} />
              {errors.partnerLastName && <p style={{ color: 'red' }}>{errors.partnerLastName.message}</p>}
            </div>

            <div className="field-group">
              <label>Your State of Origin</label>
              <StateSelect 
                value={originValue || ""} 
                onChange={(e) => setValue("origin", e.target.value, { shouldValidate: true })} 
              />
              {errors.origin && <p style={{ color: 'red' }}>{errors.origin.message}</p>}
            </div>

            <div className="field-group">
              <label>Partner's State of Origin</label>
              <StateSelect 
                value={String(partnerOriginValue ?? "")} 
                onChange={(e) => setValue("partnerOrigin", e.target.value, { shouldValidate: true })} 
              />
              {errors.partnerOrigin && <p style={{ color: 'red' }}>{errors.partnerOrigin.message}</p>}
            </div>
          </>
        )}

        <div className="field-group">
          <label>Phone Number</label>
           <input type="text" placeholder="We'll use this to keep in touch" {...register("phoneNo")} />
          
          {errors.phoneNo && <p style={{ color: 'red' }}>{errors.phoneNo.message}</p>}
        </div>

        <div className="field-group">
          <label>Select Date(s)</label>
          <input
            type="date"
            onChange={(e) => {
              if (new Date(e.target.value) > new Date()) {
                addDate(e.target.value);
                setShowError(false);
              } else {
                setShowError(true);
              }
            }}
          />
        </div>
        {showError && <p style={{ color: 'red' }}>You cannot select a date that has passed</p>}

        {booking.length > 0 && (
          <ul className="booking-list">
            {booking.map((book: string, index: number) => (
              <li key={index}>
                <span>{book}</span>
                <button type="button" onClick={() => removeDate(index)}>Remove</button>
              </li>
            ))}
          </ul>
        )}

        <PayButton
          amount={Number(amountValue)}
          booking={booking}
          validatedFormData={validatedData}
          onTriggerSubmit={handleSubmit(handleFormValidationSuccess)} 
        />

        <Link href="/login" className="admin-link">
          Are you the Parish Admin?
        </Link>

      </div>
    </form>
  );
}
