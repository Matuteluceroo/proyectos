export type FieldOption = {
  label: string
  value: string | number
}

export type Field = {
  nombreCampo: string
  labelText: string
  type:
    | 'text'
    | 'number'
    | 'password'
    | 'checkbox'
    | 'select'
    | 'radio'
    | 'textarea'
    | 'date'
    | 'time'
    | 'button'
    | "file";
  placeholder?: string
  defaultValue?: string | number | boolean
  options?: FieldOption[]
  width?: string
  onChange?: (value: any) => void
  onClick?: (value?: any) => void
}

export type GroupedField = {
  nombreCampo: string
  group: true
  fields: Field[]
}

export type FieldsListProps = (Field | GroupedField)[]

export type Props = {
  fields: (Field | GroupedField)[]
  onChangeForm?: (formValues: Record<string, any>) => void
  values?: Record<string, any> // ✅ este es el que faltaba
}

export type FormReutilizableRef = {
  getFormData: () => Record<string, any>
  setFieldValue: (campo: string, valor: any) => void
  setAllFields: (valores: Record<string, any>) => void
}
