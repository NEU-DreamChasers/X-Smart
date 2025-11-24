// Simple CVA (Class Variance Authority) implementation
// This is a lightweight replacement for class-variance-authority package

type ClassValue = string | number | boolean | undefined | null;
type ClassArray = ClassValue[];
type ClassDictionary = Record<string, any>;
type ClassProp = ClassValue | ClassArray | ClassDictionary;

export function cn(...inputs: ClassProp[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) classes.push(result);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (input[key]) classes.push(key);
      }
    }
  }
  
  return classes.join(' ');
}

type VariantConfig<V extends Record<string, Record<string, string>>> = {
  variants: V;
  defaultVariants?: {
    [K in keyof V]?: keyof V[K];
  };
};

export type VariantProps<T> = T extends (...args: any[]) => any
  ? Parameters<T>[0]
  : never;

export function cva<V extends Record<string, Record<string, string>>>(
  base: string,
  config?: VariantConfig<V>
) {
  return (props?: {
    [K in keyof V]?: keyof V[K];
  } & { className?: string }) => {
    if (!config) return cn(base, props?.className);

    const { variants, defaultVariants = {} } = config;
    const classes: string[] = [base];

    if (props) {
      for (const variantKey in variants) {
        const variantValue = props[variantKey as keyof typeof props] as string | undefined;
        const defaultValue = defaultVariants[variantKey];
        const value = variantValue ?? defaultValue;

        if (value && variants[variantKey][value]) {
          classes.push(variants[variantKey][value]);
        }
      }

      if (props.className) {
        classes.push(props.className);
      }
    } else {
      // Apply default variants
      for (const variantKey in defaultVariants) {
        const value = defaultVariants[variantKey];
        if (value && variants[variantKey]?.[value as string]) {
          classes.push(variants[variantKey][value as string]);
        }
      }
    }

    return cn(...classes);
  };
}
