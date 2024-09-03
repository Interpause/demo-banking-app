import { Toaster as RealToaster, ToasterProps } from 'react-hot-toast'

/** Preconfigured toaster for DRY reasons.
 *
 * Exists also cause of https://github.com/timolins/react-hot-toast/issues/342
 * meaning i've to place the Toaster in two locations...
 */
export default function Toaster(props: ToasterProps) {
  return (
    <RealToaster
      position="top-center"
      toastOptions={{
        // https://github.com/timolins/react-hot-toast/issues/242
        className: '!bg-base-100 !text-base-content',
      }}
      {...props}
    />
  )
}
