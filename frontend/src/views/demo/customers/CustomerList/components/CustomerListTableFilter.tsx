import { useState } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Checkbox from '@/components/ui/Checkbox'
import { Form, FormItem } from '@/components/ui/Form'
import useCustomerList from '../hooks/useCustomerList'
import { TbFilter } from 'react-icons/tb'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'

type FormSchema = {
    is_active: string
}

const channelList = [
    'Is Active',
]

const validationSchema: ZodType<FormSchema> = z.object({
    is_active: z.string()
})

const CustomerListTableFilter = () => {
    const [dialogIsOpen, setIsOpen] = useState(false)

    const { filterData, setFilterData } = useCustomerList()

    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }

    const { handleSubmit, reset, control } = useForm<FormSchema>({
        defaultValues: filterData,
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = (values: FormSchema) => {
        setFilterData(values)
        setIsOpen(false)
    }

    return (
        <>
            <Button icon={<TbFilter />} onClick={() => openDialog()}>
                Filter
            </Button>
            <Dialog
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h4 className="mb-4">Filter</h4>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem label="Customer">
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    key={'1'}
                                    name={field.name}
                                    value={filterData.is_active}
                                    className="justify-between flex-row-reverse heading-text"
                                >
                                    Is Active
                                </Checkbox>
                
                            )}
                        />
                    </FormItem>
                    <div className="flex justify-end items-center gap-2 mt-4">
                        <Button type="button" onClick={() => reset()}>
                            Reset
                        </Button>
                        <Button type="submit" variant="solid">
                            Apply
                        </Button>
                    </div>
                </Form>
            </Dialog>
        </>
    )
}

export default CustomerListTableFilter
