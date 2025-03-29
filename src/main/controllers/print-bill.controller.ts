import type { TicketBilling, LockerBilling, CostumeBill } from '../types/billing.types'
import { getTicketById } from './ticket.controller'
import { lockerDB } from '../db'
import { Locker } from '../types/locker'
import { CostumeStock } from '../types/costume.stock'
import { costumeDB } from '../db'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const escpos = require('escpos')
// eslint-disable-next-line @typescript-eslint/no-require-imports
escpos.USB = require('escpos-usb')

// Company information constants
const COMPANY_NAME = 'LAGOON WATER PARK'
const COMPANY_ADDRESS = 'Behind Annie Besant International School, Parsa Bazar,'
const COMPANY_CITY = 'Patna, Bihar - 804453'
const COMPANY_PHONE = '+91 82928 24876'
const COMPANY_EMAIL = 'lagoonwaterpark25@gmail.com'
const COMPANY_GST = 'GSTIN: 10AADCL2730N1ZR'
// const COMPANY_WEBSITE = 'www.lagoonwaterpark.com'

// Developer credit
const DEVELOPER_CREDIT = 'Designed & Developed by parivartanx.com'

/**
 * Get the connected printer device
 * @returns The printer device or null if no printer is found
 */
function getPrinterDevice() {
  try {
    // Find USB printer
    const devices = escpos.USB.findPrinter()
    if (devices.length === 0) {
      console.error('No USB printer found')
      return null
    }

    // Use the first available printer
    const device = new escpos.USB(devices[0])
    return device
  } catch (error) {
    console.error('Error accessing printer:', error)
    return null
  }
}

/**
 * Format date for printing
 * @param date Date object or string to format
 * @returns Formatted date string
 */
function formatDate(date?: Date | string): string {
  const dateObj = date ? new Date(date) : new Date()
  return dateObj.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Print a ticket billing receipt
 * @param ticket The ticket billing information
 * @returns Promise that resolves when printing is complete
 */
export const printTicket = async (ticket: TicketBilling): Promise<boolean> => {
  const device = getPrinterDevice()
  if (!device) {
    return false
  }

  try {
    // get ticket type
    for(const tkt of ticket.tickets) {
      const ticketData = await getTicketById(tkt._id)
      if(!ticketData) {
        return false
      }
      tkt.ticketType = ticketData[0].ticketType
      tkt.pricePerUnit = ticketData[0].price
    }
    // Create printer instance
    const printer = new escpos.Printer(device)

    // Open connection to the printer
    await new Promise<void>((resolve) => {
      device.open((error) => {
        if (error) {
          console.error('Error opening device:', error)
          throw error
        }
        resolve()
      })
    })

    // Print receipt
    printer
      .font('a')
      .align('ct')
      .style('b')
      .size(1, 1)
      .text(COMPANY_NAME)
      .size(0, 0)
      .text(COMPANY_ADDRESS)
      .text(COMPANY_CITY)
      .text(`Tel: ${COMPANY_PHONE}`)
      .text(COMPANY_EMAIL)
    //   .text(COMPANY_WEBSITE)
      .text(COMPANY_GST)
      .style('b')
      .size(1, 0)
      .text('BILLING RECEIPT')
      .text('------------------------')
      .align('lt')
      .style('normal')
      .size(0, 0)
      .text(`Date: ${formatDate(ticket.createdAt)}`)
      .text(`Receipt No: ${ticket._id?.substring(0, 8) || 'N/A'}`)
      .text(`Customer: ${ticket.customerName}`)
      .text(`Mobile: ${ticket.mobileNumber}`)
      .text(`Payment Mode: ${ticket.paymentMode.toUpperCase()}`)
      .text('------------------------')
      .align('ct')
      .text('TICKET DETAILS')
      .align('lt')
      .text(" ")

    // Create a professional-looking ticket table
    printer
      .align('lt')
      .size(0, 0)
      .text('------------------------------------------')
      .text(' # | TICKET TYPE         | QTY  |  UNIT RS |   TOTAL ')
      .text('------------------------------------------')

    // Add tickets in table format
    ticket.tickets.forEach((t, index) => {
      // Format number with leading zeros for better alignment
      const no = String(index + 1).padStart(2, '0');
      
      // Format ticket type with proper spacing
      let type = (t.ticketType || "Unknown");
      if (type.length > 15) {
        type = type.substring(0, 15) + "...";
      } else {
        type = type.padEnd(15, ' ');
      }
      
      // Format quantity with consistent padding
      const qty = String(t.quantity).padStart(4, ' ');
      
      // Format prices with null checks and proper formatting
      const unitPrice = t.pricePerUnit !== undefined ? t.pricePerUnit.toFixed(2) : '0.00';
      const totalPrice = t.pricePerUnit !== undefined ? (t.pricePerUnit * t.quantity).toFixed(2) : '0.00';
      
      // Format price strings with consistent padding
      const unitPriceStr = String(unitPrice).padStart(8, ' ');
      const totalPriceStr = String(totalPrice).padStart(8, ' ');
      
      // Create a clean, consistent table row
      printer
      .size(0,0)
      .text(` ${no}| ${type} |${qty} | Rs.${unitPriceStr} | Rs.${totalPriceStr}`);
    })


    // Add payment details
    printer
      .text('------------------------------------------')
      .align('rt')
      .text(`Subtotal: Rs. ${ticket.subtotal.toFixed(2)}`)
      
    if (ticket.discountAmount > 0) {
      printer.text(`Discount: Rs. ${ticket.discountAmount.toFixed(2)} (${ticket.discountType === 'percentage' ? ticket.discount + '%' : 'Flat'})`)
    }
    
    // if (ticket.gstAmount > 0) {
    //   printer.text(`GST: Rs. ${ticket.gstAmount.toFixed(2)}`)
    // }
    
    printer
      .style('b')
      .text(`Total(GST Inc): Rs. ${ticket.total.toFixed(2)}`)
      .style('normal')
      .align('ct')
      .text('------------------------------------------')
      .text('Thank you for visiting!')
      .text('Please keep this receipt')
      .text('Have a great day!')
      .text('')
      .size(0, 0)
      .text(DEVELOPER_CREDIT)
      .cut()
      .close()

    return true
  } catch (error) {
    console.error('Error printing ticket:', error)
    return false
  }
}

/**
 * Print a locker billing receipt
 * @param lockerBill The locker billing information
 * @returns Promise that resolves when printing is complete
 */
export const printLockerBill = async (lockerBill: LockerBilling): Promise<boolean> => {
  const device = getPrinterDevice()
  if (!device) {
    return false
  }

  /// extract locker no
  
  const lockers = await lockerDB.find({
    selector: {
        _id: { $in: lockerBill.lockerIds }
    }
}) as PouchDB.Find.FindResponse<Locker>;

 lockerBill.lockerNames = lockers.docs.map((locker) => locker.lockerNo)

  try {
    // Create printer instance
    const printer = new escpos.Printer(device)

    // Open connection to the printer
    await new Promise<void>((resolve) => {
      device.open((error) => {
        if (error) {
          console.error('Error opening device:', error)
          throw error
        }
        resolve()
      })
    })



    // Print receipt
    printer
      .font('a')
      .align('ct')
      .style('b')
      .size(1, 1)
      .text(COMPANY_NAME)
      .size(0, 0)
      .text(COMPANY_ADDRESS)
      .text(COMPANY_CITY)
      .text(`Tel: ${COMPANY_PHONE}`)
      .text(COMPANY_EMAIL)
    //   .text(COMPANY_WEBSITE)
      .text(COMPANY_GST)
      .style('b')
      .size(1, 0)
      .text('LOCKER RECEIPT')
      .text('------------------------')
      .align('lt')
      .style('normal')
      .size(0, 0)
      .text(`Date: ${formatDate(lockerBill.createdAt)}`)
      .text(`Receipt No: ${lockerBill._id?.substring(0, 8) || 'N/A'}`)
      .text(`Customer: ${lockerBill.customerName}`)
      .text(`Mobile: ${lockerBill.mobileNumber}`)
      .text(`Payment Mode: ${lockerBill.paymentMode.toUpperCase()}`)
      .text('------------------------')
      .align('ct')
      .text('LOCKER DETAILS')
      .align('lt')
      .text('------------------------')

    // Add locker details
    if (lockerBill.lockerNames && lockerBill.lockerNames.length > 0) {
      lockerBill.lockerNames.forEach((name, index) => {
        printer.text(`${index + 1}. Locker No: ${name}`)
      })
    }

    // Add payment details
    printer
      .text('------------------------')
      .align('rt')
      .text(`Subtotal: Rs. ${lockerBill.subtotal.toFixed(2)}`)
      
    if (lockerBill.discountAmount > 0) {
      printer.text(`Discount: Rs. ${lockerBill.discountAmount.toFixed(2)} (${lockerBill.discountType === 'percentage' ? lockerBill.discount + '%' : ''})`)
    }
    
    if (lockerBill.gstAmount > 0) {
      printer.text(`GST: Rs. ${lockerBill.gstAmount.toFixed(2)}`)
    }
    
    printer
      .style('b')
      .text(`Total(GST Inc): Rs. ${lockerBill.total.toFixed(2)}`)
      .style('normal')
      .align('ct')
      .text('------------------------')
      .text('**IMPORTANT**')
      .text('Please return the locker key')
      .text('before leaving the park')
      .text('------------------------')
      .text('Thank you for visiting!')
      .text('Have a great day!')
      .text('')
      .size(0, 0)
      .text(DEVELOPER_CREDIT)
      .cut()
      .close()

    return true
  } catch (error) {
    console.error('Error printing locker bill:', error)
    return false
  }
}

/**
 * Print a costume billing receipt
 * @param costumeBill The costume billing information
 * @returns Promise that resolves when printing is complete
 */
export const printCostumeBill = async (costumeBill: CostumeBill): Promise<boolean> => {
  const device = getPrinterDevice()
  if (!device) {
    return false
  }

  try {

    for(const costume of costumeBill.costumes) {
        const costumeStock = await costumeDB.find({
            selector: {
                _id: costume._id
            }
        }) as PouchDB.Find.FindResponse<CostumeStock>
        if(!costumeStock.docs.length) {
            return false;
        }
        costume.category = costumeStock.docs[0].category
        costume.size = costumeStock.docs[0].size
        costume.refundPrice = costumeStock.docs[0].refundPrice
       }



    // Create printer instance
    const printer = new escpos.Printer(device)

    // Open connection to the printer
    await new Promise<void>((resolve) => {
      device.open((error) => {
        if (error) {
          console.error('Error opening device:', error)
          throw error
        }
        resolve()
      })
    })

    // Print receipt
    printer
      .font('a')
      .align('ct')
      .style('b')
      .size(1, 1)
      .text(COMPANY_NAME)
      .size(0, 0)
      .text(COMPANY_ADDRESS)
      .text(COMPANY_CITY)
      .text(`Tel: ${COMPANY_PHONE}`)
      .text(COMPANY_EMAIL)
    //   .text(COMPANY_WEBSITE)
      .text(COMPANY_GST)
      .style('b')
      .size(1, 0)
      .text('COSTUME RECEIPT')
      .text('------------------------')
      .align('lt')
      .style('normal')
      .size(0, 0)
      .text(`Date: ${formatDate(costumeBill.createdAt)}`)
      .text(`Receipt No: ${costumeBill._id?.substring(0, 8) || 'N/A'}`)
      .text(`Customer: ${costumeBill.customerName}`)
      .text(`Mobile: ${costumeBill.customerNumber}`)
      .text(`Payment Mode: ${costumeBill.paymentMode.toUpperCase()}`)
      .text('------------------------')
      .align('ct')
      .text('COSTUME DETAILS')
      .align('lt')
      .text(' ')

    // Create a costume table with proper alignment
    printer
      .size(0, 0)
      .text('------------------------------------------')
      .text(' # | CATEGORY/SIZE      | QTY |  AMOUNT  | REFUNDABLE')
      .text('------------------------------------------')

    // Add costumes in table format
    costumeBill.costumes.forEach((costume, index) => {
      // Format number and description
      const no = String(index + 1).padStart(2, '0');
      const category = costume.category || 'Costume';
      const size = costume.size || 'Standard';
      const description = `${category}/${size}`;
      const formattedDesc = description.length > 16 
        ? description.substring(0, 13) + '...' 
        : description.padEnd(16, ' ');
      
      // Format other columns
      const qty = String(costume.quantity).padStart(3, ' ');
      const amount = `Rs.${costume.amount.toFixed(2)}`.padStart(8, ' ');
      const refund = costume.refundPrice && costume.refundPrice > 0
        ? `Rs.${costume.refundPrice.toFixed(2)}`.padStart(8, ' ')
        : 'N/A'.padStart(8, ' ');
      
      // Print the table row
      printer
        .size(0, 0)
        .text(` ${no}| ${formattedDesc} |${qty} | ${amount} | ${refund}`);
    });

    // Add table footer
    printer.text('------------------------------------------')

    // Add payment details
    printer
      .text('------------------------')
      .align('rt')
      .text(`Subtotal: Rs. ${costumeBill.subtotal.toFixed(2)}`)
      
    if (costumeBill.discountAmount > 0) {
      printer.text(`Discount: Rs. ${costumeBill.discountAmount.toFixed(2)} (${costumeBill.discountType === 'percentage' ? costumeBill.discount + '%' : 'Flat'})`)
    }
    
    if (costumeBill.gstAmount > 0) {
      printer.text(`GST: Rs. ${costumeBill.gstAmount.toFixed(2)}`)
    }
    
    printer
      .style('b')
      .text(`Total(GST Inc): Rs. ${costumeBill.total.toFixed(2)}`)
      .style('normal')
      .align('ct')
      .text('------------------------')
      .text('**IMPORTANT**')
      .text('Please return the costume')
      .text('in good condition to')
      .text('receive your refund')
      .text('------------------------')
      .text('Thank you for visiting!')
      .text('Have a great day!')
      .text('')
      .size(0, 0)
      .text(DEVELOPER_CREDIT)
      .cut()
      .close()

    return true
  } catch (error) {
    console.error('Error printing costume bill:', error)
    return false
  }
}

/**
 * Print a refund receipt for costume or locker return
 * @param billType Type of bill ('costume' or 'locker')
 * @param billData The billing data with refund information
 * @returns Promise that resolves when printing is complete
 */
export const printRefundReceipt = async (
  billType: 'costume' | 'locker', 
  billData: CostumeBill | LockerBilling
): Promise<boolean> => {
  const device = getPrinterDevice()
  if (!device) {
    return false
  }

  try {
    // Create printer instance
    const printer = new escpos.Printer(device)

    // Open connection to the printer
    await new Promise<void>((resolve) => {
      device.open((error) => {
        if (error) {
          console.error('Error opening device:', error)
          throw error
        }
        resolve()
      })
    })

    // Common receipt header
    printer
      .font('a')
      .align('ct')
      .style('b')
      .size(1, 1)
      .text(COMPANY_NAME)
      .size(0, 0)
      .text(COMPANY_ADDRESS)
      .text(COMPANY_CITY)
      .text(`Tel: ${COMPANY_PHONE}`)
      .text(COMPANY_EMAIL)
    //   .text(COMPANY_WEBSITE)
      .text(COMPANY_GST)
      .style('b')
      .size(1, 0)
      .text('REFUND RECEIPT')
      .text('------------------------')
      .align('lt')
      .style('normal')
      .size(0, 0)
      .text(`Date: ${formatDate()}`)
      .text(`Original Receipt: ${billData._id?.substring(0, 8) || 'N/A'}`)
      
    if (billType === 'costume') {
      const costumeBill = billData as CostumeBill
      printer
        .text(`Customer: ${costumeBill.customerName}`)
        .text(`Mobile: ${costumeBill.customerNumber}`)
        .text('------------------------')
        .align('ct')
        .text('COSTUME RETURN DETAILS')
        .align('lt')
        .text('------------------------')
        .text(`Original Amount: Rs. ${costumeBill.total.toFixed(2)}`)
        .text(`Refund Amount: Rs. ${costumeBill.refundAmount?.toFixed(2) || '0.00'}`)
    } else {
      const lockerBill = billData as LockerBilling
      printer
        .text(`Customer: ${lockerBill.customerName}`)
        .text(`Mobile: ${lockerBill.mobileNumber}`)
        .text('------------------------')
        .align('ct')
        .text('LOCKER RETURN DETAILS')
        .align('lt')
        .text('------------------------')
        .text(`Original Amount: Rs. ${lockerBill.total.toFixed(2)}`)
        .text(`Refund Amount: Rs. ${lockerBill.refundAmount?.toFixed(2) || '0.00'}`)
    }

    // Complete receipt
    printer
      .text('------------------------')
      .align('ct')
      .text('Thank you for returning')
      .text(`your ${billType}!`)
      .text('Have a great day!')
      .text('')
      .size(0, 0)
      .text(DEVELOPER_CREDIT)
      .cut()
      .close()

    return true
  } catch (error) {
    console.error(`Error printing ${billType} refund:`, error)
    return false
  }
}
