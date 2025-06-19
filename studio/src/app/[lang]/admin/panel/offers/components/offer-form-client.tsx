"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Offer, CreateOfferPayload } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns'; // For date handling
import { cn } from "@/lib/utils"; // For shadcn class utility

const offerSchema = z.object({
  descripcion: z.string().min(5, "Description must be at least 5 characters"),
  descuento: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, "Discount must be at least 0.01 (1%)").max(1, "Discount cannot exceed 1 (100%)")
  ),
  fechaInicio: z.date({ required_error: "Start date is required." }),
  fechaFin: z.date({ required_error: "End date is required." }),
  // libroIds are managed in a separate component, not directly in this form for now
}).refine(data => data.fechaFin >= data.fechaInicio, {
  message: "End date cannot be before start date",
  path: ["fechaFin"], // Point error to end date field
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferFormClientProps {
  offer?: Offer;
  onSave: (data: Partial<Offer>) => Promise<void>;
  isSubmitting: boolean;
  texts: any; 
  lang: string;
}

export function OfferFormClient({ offer, onSave, isSubmitting, texts, lang }: OfferFormClientProps) {
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: offer ? {
      descripcion: offer.descripcion || '',
      descuento: offer.descuento || 0.1,
      fechaInicio: offer.fechaInicio ? parseISO(offer.fechaInicio) : new Date(),
      fechaFin: offer.fechaFin ? parseISO(offer.fechaFin) : new Date(new Date().setDate(new Date().getDate() + 7)),
    } : {
      descripcion: '',
      descuento: 0.1, // Default 10%
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 7 days from now
    },
  });
  
  useEffect(() => {
    if (offer) {
      form.reset({
        descripcion: offer.descripcion || '',
        descuento: offer.descuento || 0.1,
        fechaInicio: offer.fechaInicio ? parseISO(offer.fechaInicio) : new Date(),
        fechaFin: offer.fechaFin ? parseISO(offer.fechaFin) : new Date(new Date().setDate(new Date().getDate() + 7)),
      });
    } else {
       form.reset({
        descripcion: '',
        descuento: 0.1,
        fechaInicio: new Date(),
        fechaFin: new Date(new Date().setDate(new Date().getDate() + 7)),
      });
    }
  }, [offer, form]);

  const onSubmitHandler: SubmitHandler<OfferFormData> = async (formData) => {
    const payload: Partial<Offer> = {
      id: offer?.id,
      descripcion: formData.descripcion,
      descuento: formData.descuento,
      fechaInicio: formData.fechaInicio.toISOString(),
      fechaFin: formData.fechaFin.toISOString(),
      // libroIds will be managed elsewhere or passed if this form were to handle it
    };
    await onSave(payload);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              {offer ? texts.editOffer : texts.addNewOffer}
            </CardTitle>
            <CardDescription>
              {offer ? "Edit the details of the offer." : "Fill in the details to create a new offer."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="descripcion" render={({ field }) => (
              <FormItem>
                <FormLabel>{texts.offerDescriptionLabel}</FormLabel>
                <FormControl>
                  <Textarea placeholder={texts.offerDescriptionPlaceholder} {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="descuento" render={({ field }) => (
              <FormItem>
                <FormLabel>{texts.offerDiscountLabel}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0.01" max="1" placeholder={texts.offerDiscountPlaceholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="fechaInicio" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{texts.offerStartDateLabel}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} // Disable past dates
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fechaFin" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{texts.offerEndDateLabel}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < (form.getValues("fechaInicio") || new Date(new Date().setDate(new Date().getDate() -1)))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-start">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {offer ? texts.saveButton : texts.addButton}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
