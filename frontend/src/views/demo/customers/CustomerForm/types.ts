import type { Control, FieldErrors } from 'react-hook-form'

export type OverviewFields = {
    first_name: string
    last_name: string
    email: string
    password: string
    role: string
    subRole: any
    company:number
}

export type AddressFields = {
    country: string
    address: string
    postcode: string
    city: string
}

export type ProfileImageFields = {
    img: string
}

export type TagsFields = {
    tags: Array<{ value: string; label: string }>
}

export type AccountField = {
    banAccount?: boolean
    accountVerified?: boolean
}

export type CustomerFormSchema = OverviewFields &
    AddressFields &
    ProfileImageFields &
    TagsFields &
    AccountField

export type FormSectionBaseProps = {
    control: Control<CustomerFormSchema>
    errors: FieldErrors<CustomerFormSchema>
}
