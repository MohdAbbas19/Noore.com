function studio(){
  return {
    userEmail:"", view:"studio", loading:false, error:"", creative:null, history:[],
    form:{product:"",audience:"",platform:"Instagram",objective:"Conversions",tone:"Bold & modern",visualStyle:"Premium studio"},
    async init(){
      const s=await hatchable.auth.getSession();
      if(!s || !s.user){ location.href="/login?next=/app.html"; return; }
      this.userEmail=s.user.email||"";
      await this.loadHistory();
    },
    async loadHistory(){
      try{ const r=await fetch("/api/creatives/list"); if(r.ok)this.history=await r.json(); }catch(e){}
    },
    async generate(){
      this.error="";
      if(!this.form.product.trim()||!this.form.audience.trim()){this.error="Add a product and target audience first.";return;}
      this.loading=true;
      try{
        const r=await fetch("/api/creatives/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.form)});
        const data=await r.json();
        if(!r.ok) throw new Error(data.error||"Generation failed.");
        this.creative=data.creative;
        this.history=[data.creative,...this.history.filter(x=>x.id!==data.creative.id)];
      }catch(e){this.error=e.message||"Something went wrong."}
      finally{this.loading=false}
    },
    async copyCreative(){
      if(!this.creative)return;
      const text=[this.creative.headline,this.creative.primary_text,"CTA: "+this.creative.call_to_action,"Visual concept: "+this.creative.concept].join("\n\n");
      await navigator.clipboard.writeText(text);
    },
    async signOut(){await hatchable.auth.signOut();location.href="/";}
  }
}