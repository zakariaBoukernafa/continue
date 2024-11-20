import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Button, Input, InputSubtext, StyledActionButton } from "../components";
import AddModelButtonSubtext from "../components/AddModelButtonSubtext";
import ModelSelectionListbox from "../components/modelSelection/ModelSelectionListbox";
import { IdeMessengerContext } from "../context/IdeMessenger";
import {
  ProviderInfo,
  providers,
} from "../pages/AddNewModel/configs/providers";
import { setDefaultModel } from "../redux/slices/stateSlice";
import { completionParamsInputs } from "../pages/AddNewModel/configs/completionParamsInputs";

interface QuickModelSetupProps {
  onDone: () => void;
}

const MODEL_PROVIDERS_URL = "https://antalyse.com/customize/model-providers";

function AddModelForm({ onDone }: QuickModelSetupProps) {
  // Default to Ollama as the first local provider
  const [selectedProvider, setSelectedProvider] = useState<ProviderInfo>(
    providers["ollama"]!,
  );

  const [selectedModel, setSelectedModel] = useState(
    selectedProvider.packages[0],
  );

  const formMethods = useForm();
  const dispatch = useDispatch();
  const ideMessenger = useContext(IdeMessengerContext);

  function isDisabled() {
    if (selectedProvider.downloadUrl) {
      return false;
    }

    const required = selectedProvider.collectInputFor
      .filter((input) => input.required)
      .map((input) => {
        const value = formMethods.watch(input.key);
        return value;
      });

    return !required.every((value) => value !== undefined && value.length > 0);
  }

  useEffect(() => {
    setSelectedModel(selectedProvider.packages[0]);
  }, [selectedProvider]);

  function onSubmit() {
    const reqInputFields = {};
    for (let input of selectedProvider.collectInputFor) {
      reqInputFields[input.key] = formMethods.watch(input.key);
    }

    const model = {
      ...selectedProvider.params,
      ...selectedModel.params,
      ...reqInputFields,
      provider: selectedProvider.provider,
      title: selectedModel.title,
    };

    ideMessenger.post("config/addModel", { model });
    ideMessenger.post("openConfigJson", undefined);

    dispatch(setDefaultModel({ title: model.title, force: true }));

    onDone();
  }

  function onClickDownloadProvider() {
    selectedProvider.downloadUrl &&
      ideMessenger.post("openUrl", selectedProvider.downloadUrl);
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-md p-6">
          <h1 className="mb-0 text-center text-2xl">Add Local Model</h1>

          <div className="my-8 flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium">Provider</label>
              <ModelSelectionListbox
                selectedProvider={selectedProvider}
                setSelectedProvider={setSelectedProvider}
                options={Object.entries(providers)
                  .filter(([key]) =>
                    ["ollama", "llamacpp", "localai"].includes(key),
                  )
                  .map(([, provider]) => provider)}
              />
              <InputSubtext className="mb-0">
                <a
                  className="cursor-pointer text-inherit underline hover:text-inherit"
                  onClick={() =>
                    ideMessenger.post("openUrl", MODEL_PROVIDERS_URL)
                  }
                >
                  Learn more
                </a>{" "}
                about local model providers
              </InputSubtext>
            </div>

            {selectedProvider.downloadUrl && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Install provider
                </label>

                <StyledActionButton onClick={onClickDownloadProvider}>
                  <p className="text-sm underline">
                    {selectedProvider.downloadUrl}
                  </p>
                  <ArrowTopRightOnSquareIcon width={24} height={24} />
                </StyledActionButton>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Model</label>
              <ModelSelectionListbox
                selectedProvider={selectedModel}
                setSelectedProvider={setSelectedModel}
                options={
                  Object.entries(providers).find(
                    ([, provider]) => provider.title === selectedProvider.title,
                  )?.[1].packages
                }
              />
            </div>

            {selectedProvider.collectInputFor &&
              selectedProvider.collectInputFor
                .filter(
                  (field) =>
                    !Object.values(completionParamsInputs).some(
                      (input) => input.key === field.key,
                    ) && field.required,
                )
                .map((field) => (
                  <div>
                    <>
                      <label className="mb-1 block text-sm font-medium">
                        {field.label}
                      </label>
                      <Input
                        id={field.key}
                        className="w-full"
                        defaultValue={field.defaultValue}
                        placeholder={`${field.placeholder}`}
                        {...formMethods.register(field.key)}
                      />
                    </>
                  </div>
                ))}
          </div>

          <div className="mt-4 w-full">
            <Button type="submit" className="w-full" disabled={isDisabled()}>
              Connect
            </Button>
            <AddModelButtonSubtext />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default AddModelForm;
