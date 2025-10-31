import { Checkbox, createDisclosure, HStack } from "@hope-ui/solid"
import { createSignal, onCleanup } from "solid-js"
import { ModalFolderChoose } from "~/components"
import { useFetch, usePath, useRouter, useT } from "~/hooks"
import { selectedObjs } from "~/store"
import { bus, fsCopy, fsMove, handleRespWithNotifySuccess } from "~/utils"

type ConflictPolicyChooseProps = {
  toolName: string
  header: string
  loading?: boolean
  onOk: (
    src: string,
    dst: string,
    names: string[],
    overwrite: boolean,
    skip_existing: boolean,
  ) => Promise<any>
}

export const ConflictPolicyChoose = (props: ConflictPolicyChooseProps) => {
  const t = useT()
  const { isOpen, onOpen, onClose } = createDisclosure()
  const { pathname } = useRouter()
  const { refresh } = usePath()

  const [overwrite, setOverwrite] = createSignal(false)
  const [skipExisting, setSkipExisting] = createSignal(false)

  const handler = (name: string) => {
    if (name === props.toolName) {
      onOpen()
      setOverwrite(false)
      setSkipExisting(false)
    }
  }

  bus.on("tool", handler)
  onCleanup(() => {
    bus.off("tool", handler)
  })

  return (
    <ModalFolderChoose
      header={props.header}
      opened={isOpen()}
      onClose={onClose}
      loading={props.loading}
      footerSlot={
        <HStack class="title" w="$full" p="$2">
          <Checkbox
            mr="auto"
            checked={overwrite()}
            onChange={() => {
              const curOverwrite = !overwrite()
              if (curOverwrite) {
                setSkipExisting(false)
              }
              setOverwrite(curOverwrite)
            }}
          >
            {t("home.conflict_policy.overwrite_existing")}
          </Checkbox>
          <Checkbox
            mr="auto"
            checked={skipExisting()}
            onChange={() => {
              setSkipExisting(!skipExisting())
            }}
            disabled={overwrite()}
          >
            {t("home.conflict_policy.skip_existing")}
          </Checkbox>
        </HStack>
      }
      onSubmit={async (dst) => {
        const resp = await props.onOk(
          pathname(),
          dst,
          selectedObjs().map((obj) => obj.name),
          overwrite(),
          skipExisting(),
        )
        handleRespWithNotifySuccess(resp, () => {
          refresh()
          onClose()
        })
      }}
    />
  )
}

export const Copy = () => {
  const t = useT()
  const [loading, ok] = useFetch(fsCopy)

  return (
    <ConflictPolicyChoose
      toolName="copy"
      header={t("home.toolbar.choose_dst_folder")}
      loading={loading()}
      onOk={ok}
    />
  )
}

export const Move = () => {
  const t = useT()
  const [loading, ok] = useFetch(fsMove)

  return (
    <ConflictPolicyChoose
      toolName="move"
      header={t("home.toolbar.choose_dst_folder")}
      loading={loading()}
      onOk={ok}
    />
  )
}
