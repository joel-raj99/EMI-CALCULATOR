"use client";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend as RechartsLegend, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

const COLORS = ["#3b82f6", "#06b6d4", "#ff7c7c"];

export default function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState(800000);
  const [downPayment, setDownPayment] = useState(200000);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(30);
  const [taxRate, setTaxRate] = useState(1.2);
  const [insurance, setInsurance] = useState(200);
  const [extraPayment, setExtraPayment] = useState(0);
  const [startMonth, setStartMonth] = useState(0);

  const [emi, setEmi] = useState(0);
  const [tax, setTax] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [payoffDate, setPayoffDate] = useState("");
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showChart, setShowChart] = useState(false);
  

  const [savedCalculations, setSavedCalculations] = useState([]);
  const [calculationName, setCalculationName] = useState("");

  const principal = loanAmount - downPayment;

  useEffect(() => {
    if (principal <= 0) return;

    const r = rate / 12 / 100;
    const n = years * 12;

    const emiCalc =
      (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const monthlyTax = (loanAmount * taxRate) / 100 / 12;

    setEmi(Math.round(emiCalc));
    setTax(Math.round(monthlyTax));

  
    let balance = principal;
    let totalInt = 0;
    const schedule = [];
    let month = 0;

    while (balance > 0 && month < n * 2) {
      const interestPayment = balance * r;
      let principalPayment = emiCalc - interestPayment;
      
 
      if (month >= startMonth && extraPayment > 0) {
        principalPayment += extraPayment;
      }

      if (principalPayment > balance) {
        principalPayment = balance;
      }

      balance -= principalPayment;
      totalInt += interestPayment;
      month++;


      if (month % 12 === 0 || balance <= 0) {
        schedule.push({
          year: Math.ceil(month / 12),
          balance: Math.round(balance),
          principal: Math.round(principal - balance),
          interest: Math.round(totalInt),
        });
      }

      if (balance <= 0) break;
    }

    setTotalInterest(Math.round(totalInt));
    setTotalCost(Math.round(principal + totalInt));
    setAmortizationSchedule(schedule);


    const payoffMonths = month;
    const currentDate = new Date();
    const payoffDateCalc = new Date(currentDate);
    payoffDateCalc.setMonth(payoffDateCalc.getMonth() + payoffMonths);
    setPayoffDate(
      payoffDateCalc.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    );
  }, [loanAmount, downPayment, rate, years, taxRate, principal, extraPayment, startMonth]);

  const totalPayment = emi + tax + insurance + extraPayment;

  const data = [
    { name: "Principal & Interest", value: emi },
    { name: "Taxes", value: tax },
    { name: "Insurance", value: insurance },
  ];

  const monthsWithoutExtra = years * 12;
  const monthsWithExtra = amortizationSchedule.length * 12;
  const monthsSaved = monthsWithoutExtra - monthsWithExtra;
  const yearsSaved = (monthsSaved / 12).toFixed(1);

  // Calculate interest without extra payment
  const rMonthly = rate / 12 / 100;
  const nMonths = years * 12;
  const totalPaymentWithoutExtra = emi * nMonths;
  const interestWithoutExtra = totalPaymentWithoutExtra - principal;
  const interestSaved = Math.round(interestWithoutExtra - totalInterest);

  const handleReset = () => {
    setLoanAmount(800000);
    setDownPayment(200000);
    setRate(4.5);
    setYears(30);
    setTaxRate(1.2);
    setInsurance(200);
    setExtraPayment(0);
    setStartMonth(0);
  };

  const handleSaveCalculation = () => {
    const name = calculationName.trim() || `Calculation ${savedCalculations.length + 1}`;
    
    const newCalculation = {
      id: Date.now(),
      name,
      timestamp: new Date().toISOString(),
      inputs: {
        loanAmount,
        downPayment,
        rate,
        years,
        taxRate,
        insurance,
        extraPayment,
        startMonth
      },
      results: {
        principal,
        emi,
        tax,
        totalPayment,
        totalInterest,
        totalCost,
        payoffDate,
        yearsSaved: extraPayment > 0 ? yearsSaved : "0",
        interestSaved: extraPayment > 0 ? interestSaved : 0
      },
      schedule: amortizationSchedule
    };

    setSavedCalculations([...savedCalculations, newCalculation]);
    setCalculationName("");
    setShowSchedule(true);
    alert(`✅ Calculation "${name}" saved successfully!`);
  };

  const handleLoadCalculation = (calc) => {
    setLoanAmount(calc.inputs.loanAmount);
    setDownPayment(calc.inputs.downPayment);
    setRate(calc.inputs.rate);
    setYears(calc.inputs.years);
    setTaxRate(calc.inputs.taxRate);
    setInsurance(calc.inputs.insurance);
    setExtraPayment(calc.inputs.extraPayment);
    setStartMonth(calc.inputs.startMonth);
  };

  const handleDeleteCalculation = (id) => {
    if (confirm("Are you sure you want to delete this calculation?")) {
      setSavedCalculations(savedCalculations.filter(calc => calc.id !== id));
    }
  };

  const handleCompare = () => {
    alert(`Comparison:
    
Without Extra Payment:
- Total Interest: $${Math.round(interestWithoutExtra).toLocaleString()}
- Loan Term: ${years} years

With $${extraPayment} Extra Payment:
- Total Interest: $${totalInterest.toLocaleString()}
- Interest Saved: $${interestSaved.toLocaleString()}
- Time Saved: ${yearsSaved} years
- Payoff Date: ${payoffDate}`);
  };

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Advanced Mortgage Calculator
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleCompare}
              className="px-4 py-2  text-white rounded-sm hover:bg-blue-600 transition text-sm"
            >
              Compare
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-sm hover:bg-gray-600 transition text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
         
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Loan Details
              </h2>
              <div className="space-y-5">
                <Input
                  label="Loan Amount"
                  value={loanAmount}
                  setValue={setLoanAmount}
                  prefix="$"
                />
                <Input
                  label="Down Payment"
                  value={downPayment}
                  setValue={setDownPayment}
                  prefix="$"
                />
                <Input
                  label="Interest Rate"
                  value={rate}
                  setValue={setRate}
                  suffix="%"
                  step="0.1"
                />
                <Input
                  label="Loan Term"
                  value={years}
                  setValue={setYears}
                  suffix="years"
                />
                <Input
                  label="Property Tax"
                  value={taxRate}
                  setValue={setTaxRate}
                  suffix="% / year"
                  step="0.1"
                />
                <Input
                  label="Insurance (Monthly)"
                  value={insurance}
                  setValue={setInsurance}
                  prefix="$"
                />
              </div>
            </div>

      
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Extra Payments
              </h2>
              <div className="space-y-5">
                <Input
                  label="Extra Monthly Payment"
                  value={extraPayment}
                  setValue={setExtraPayment}
                  prefix="$"
                />
                <Input
                  label="Start Extra Payment After (Months)"
                  value={startMonth}
                  setValue={setStartMonth}
                  suffix="months"
                />
                {extraPayment > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-semibold text-green-800 mb-2">
                      Savings Summary
                    </h3>
                    <div className="space-y-1 text-sm text-green-700">
                      <p>💰 Interest Saved: ${interestSaved.toLocaleString()}</p>
                      <p>⏱️ Time Saved: {yearsSaved} years</p>
                      <p>📅 New Payoff: {payoffDate}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

      
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Save This Calculation
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter calculation name (optional)"
                  value={calculationName}
                  onChange={(e) => setCalculationName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  onClick={handleSaveCalculation}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition font-semibold shadow-md"
                >
                  💾 Save Calculation
                </button>
              </div>
            </div>
          </div>

        
          <div className="space-y-6">
         
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-medium text-gray-800 text-center mb-6">
                Monthly Payment Breakdown
              </h2>

         
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <PieChart width={280} height={280}>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={120}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      {data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm text-gray-500 mb-1">
                      Monthly Payment
                    </span>
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      ${totalPayment.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

        
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2">
                <Legend color="bg-[#ff7c7c]" label="Insurance" value={insurance} />
                <Legend color="bg-cyan-500" label="Taxes" value={tax} />
                <Legend
                  color=""
                  label="Principal & Interest"
                  value={emi}
                />
              </div>
            </div>

     
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Loan Summary
              </h2>
              <div className="space-y-4">
                <Row label="Loan Amount" value={`$${loanAmount.toLocaleString()}`} />
                <Row label="Down Payment" value={`$${downPayment.toLocaleString()}`} />
                <Row label="Principal Amount" value={`$${principal.toLocaleString()}`} />
                <Row label="Total Interest" value={`$${totalInterest.toLocaleString()}`} />
                <Row label="Total Cost" value={`$${totalCost.toLocaleString()}`} />
                <Row label="Payoff Date" value={payoffDate} />
              </div>
            </div>

    
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowChart(!showChart)}
                className="px-6 py-3  text-white rounded-xl hover:bg-blue-600 transition font-semibold"
              >
                {showChart ? "Hide" : "Show"} Chart
              </button>
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition font-semibold"
              >
                {showSchedule ? "Hide" : "Show"} Saved
              </button>
            </div>
          </div>
        </div>

   
        {showChart && (
          <div className="mt-8 bg-white rounded-3xl shadow-lg p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Principal vs Interest Over Time
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={amortizationSchedule}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -5 }} />
                <YAxis label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <RechartsLegend />
                <Line type="monotone" dataKey="principal" stroke="#3b82f6" strokeWidth={2} name="Principal Paid" />
                <Line type="monotone" dataKey="interest" stroke="#ef4444" strokeWidth={2} name="Interest Paid" />
                <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} name="Remaining Balance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

  
        {showSchedule && (
          <div className="mt-8 bg-white rounded-3xl shadow-lg p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Saved Calculations ({savedCalculations.length})
            </h2>
            
            {savedCalculations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">📊</div>
                <p className="text-gray-500">No saved calculations yet.</p>
                <p className="text-sm text-gray-400 mt-2">Click "Save Calculation" to store your current scenario.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {savedCalculations.map((calc) => (
                  <div key={calc.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{calc.name}</h3>
                        <p className="text-sm text-gray-500">
                          Saved on {new Date(calc.timestamp).toLocaleDateString()} at {new Date(calc.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadCalculation(calc)}
                          className="px-4 py-2  text-white rounded-sm hover:bg-blue-600 transition text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteCalculation(calc.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs text-blue-600 mb-1">Monthly Payment</p>
                        <p className="text-lg font-bold text-blue-900">${calc.results.totalPayment.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-xs text-green-600 mb-1">Total Interest</p>
                        <p className="text-lg font-bold text-green-900">${calc.results.totalInterest.toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4">
                        <p className="text-xs text-purple-600 mb-1">Total Cost</p>
                        <p className="text-lg font-bold text-purple-900">${calc.results.totalCost.toLocaleString()}</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-4">
                        <p className="text-xs text-orange-600 mb-1">Payoff Date</p>
                        <p className="text-sm font-bold text-orange-900">{calc.results.payoffDate}</p>
                      </div>
                    </div>

                
                    <div className="overflow-x-auto">
                      <h4 className="font-semibold text-gray-700 mb-3">Amortization Schedule (Yearly)</h4>
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-gray-700">Year</th>
                            <th className="px-4 py-2 font-semibold text-gray-700">Principal Paid</th>
                            <th className="px-4 py-2 font-semibold text-gray-700">Interest Paid</th>
                            <th className="px-4 py-2 font-semibold text-gray-700">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calc.schedule.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-2">{item.year}</td>
                              <td className="px-4 py-2">${item.principal.toLocaleString()}</td>
                              <td className="px-4 py-2">${item.interest.toLocaleString()}</td>
                              <td className="px-4 py-2">${item.balance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



function Input({ label, value, setValue, prefix, suffix, step = "1" }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-2">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          step={step}
          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            prefix ? "pl-8" : ""
          } ${suffix ? "pr-24" : ""}`}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
        <p className="font-semibold text-gray-900 text-sm sm:text-base">
          ${value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}