import { Form, Input, Button } from 'antd';
import { FormikErrors, FormikProps, withFormik } from 'formik'
import * as React from 'react'

import Schema from "@cg/common"

// interfaces define types in typescript
// names of these fields must match names of yup validation schema
interface FormValues {
    email: string;
    password: string;
}

interface Props {
    submit: (values: FormValues) => Promise<FormikErrors<FormValues> | null>; //this is the proper type... could use Promise<any>
}


// is wrapped below in higher order component withFormik
// https://www.youtube.com/watch?v=pbCrDBQFU_A&list=PLN3n1USn4xlnfJIQBa6bBjjiECnk6zL6s&index=5
// 18:00 - 20:00 
class C extends React.PureComponent<FormikProps<FormValues> & Props> {
    render() {
        const { values, handleChange, handleBlur, handleSubmit, touched, errors } = this.props;
        return (
            <div style={{ display: 'flex' }}>
                <div style={{ width: 400, margin: 'auto' }}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please enter your email' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                    </Button>
                    </Form.Item>
                </div >
            </div >
        );
    }
}

// recieves a prop called submit
// set email and password to blank string
// values are the values in the form
//

export const PSignUpView = withFormik<Props, FormValues>({
    mapPropsToValues: (props) => ({ email: '', password: '' }),
    handleSubmit: async (values, { props, setErrors }) => {
        const errors = await props.submit(values);
        if (errors) {
            setErrors(errors);
        }
    }
})(C);