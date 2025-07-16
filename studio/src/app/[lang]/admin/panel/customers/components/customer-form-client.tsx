"use client";

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Save, Trash2 } from 'lucide-react';

const schema = z.object({
  nombre: z.string().min(1, "Name cannot be empty."),
  email: z.string().email("Invalid email"),
  activo: z.boolean().optional(),
});

type CustomerFormData = z.infer<typeof schema>;

interface CustomerFormClientProps {
  customer?: User;
  onSave: (data: Partial<User>) => Promise<void>;
  onDelete?: (id: string | number) => Promise<void>;
  lang: string;
  texts: any;
}

export function CustomerFormClient({ customer, onSave, onDelete, lang, texts }: CustomerFormClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', email: '', activo: true },
  });

  useEffect(() => {
    if (customer) form.reset({ nombre: customer.nombre, email: customer.email, activo: customer.activo ?? true });
  }, [customer, form]);

  const onSubmit: SubmitHandler<CustomerFormData> = async data => {
    setIsSaving(true);
    try {
      const payload: Partial<User> = { ...data };
      if (customer?.id) payload.id = customer.id;
      await onSave(payload);
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (customer && onDelete) {
      setIsSaving(true);
      try { await onDelete(customer.id); } finally { setIsSaving(false); }
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{customer ? texts.editCustomer : texts.addNewCustomer}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="nombre" render={({ field }) => (
              <FormItem>
                <FormLabel>{texts.nameLabel}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>{texts.emailLabel}</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="activo" render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormLabel>{texts.activeLabel}</FormLabel>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {customer ? texts.saveButton : texts.addButton}
            </Button>
            {customer && onDelete && (
              <Button type="button" variant="destructive" size="lg" onClick={handleDelete} disabled={isSaving}>
                <Trash2 className="mr-2 h-5 w-5" /> {texts.deleteButton}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
