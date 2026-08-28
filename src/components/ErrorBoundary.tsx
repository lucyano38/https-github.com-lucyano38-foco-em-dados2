import React from 'react';
export class ErrorBoundary extends React.Component<{children:React.ReactNode;fallback?:React.ReactNode},{hasError:boolean}> {
  constructor(props:any){super(props);this.state={hasError:false};}
  static getDerivedStateFromError(){return{hasError:true};}
  render(){
    if(this.state.hasError){
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0908] text-[#d4a574]">
          <div className="text-center space-y-4 p-6">
            <p className="text-lg font-semibold">Algo deu errado ao carregar esta seção.</p>
            <p className="text-sm opacity-80">Isso pode ser temporário. Se quiser, tente trocar de aba ou recarregar.</p>
            <button onClick={()=>window.location.reload()} className="px-4 py-2 rounded-lg bg-[#ffc107] text-[#3f2e00] font-bold">Recarregar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
